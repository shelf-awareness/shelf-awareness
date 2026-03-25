'use server';

import { Prisma, QuantityUnit } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { geocodeAddress } from './geocode';

/**
 * Creates a new user.
 */
export async function createUser({ email, password }: { email: string; password: string }) {
  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  return user;
}


/**
 * Changes a user's password, checking the old password.
 */
export async function changePassword({
  email,
  oldPassword,
  newPassword,
}: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  const match = await compare(oldPassword, user.password);
  if (!match) {
    return { success: false, message: 'Old password is incorrect.' };
  }

  if (oldPassword === newPassword) {
    return { success: false, message: 'New password must be different from old password.' };
  }

  if (newPassword.length < 6 || newPassword.length > 40) {
    return { success: false, message: 'Password must be between 6 and 40 characters.' };
  }

  const hashedPassword = await hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return { success: true };
}

/**
 * Adds a new produce.
 */
export async function addProduce(produce: {
  name: string;
  type: string;
  location: string;
  storage: string;
  quantity: number;
  unit: string;
  expiration: string | Date | null;
  owner: string;
  image: string | null;
  restockThreshold?: number;
}) {
  // Upsert or find Location by name + owner
  const location = await prisma.location.upsert({
    where: { name_owner: { name: produce.location, owner: produce.owner } },
    update: {},
    create: { name: produce.location, owner: produce.owner, address: null },
  });

  // Upsert or find Storage by name + locationId
  const storage = await prisma.storage.upsert({
    where: { name_locationId: { name: produce.storage, locationId: location.id } },
    update: {},
    create: { name: produce.storage, locationId: location.id },
  });

  // Create or update Produce, linking by IDs
  const newProduce = await prisma.produce.upsert({
    where: { name_owner: { name: produce.name, owner: produce.owner } },
    update: {
      type: produce.type,
      locationId: location.id,
      storageId: storage.id,
      quantity: produce.quantity,
      unit: produce.unit,
      expiration: produce.expiration ? new Date(produce.expiration) : null,
      image: produce.image ?? null,
      restockThreshold: produce.restockThreshold ?? 0,
    },
    create: {
      name: produce.name,
      type: produce.type,
      owner: produce.owner,
      locationId: location.id,
      storageId: storage.id,
      quantity: produce.quantity,
      unit: produce.unit,
      expiration: produce.expiration ? new Date(produce.expiration) : null,
      image: produce.image ?? null,
      restockThreshold: produce.restockThreshold ?? 0,
    },
  });

  // Auto-add to shopping list if below threshold
  if (newProduce.restockThreshold !== null && newProduce.quantity <= newProduce.restockThreshold) {
    const shoppingList = await prisma.shoppingList.upsert({
      where: { name_owner: { name: 'Auto Restock', owner: newProduce.owner } },
      update: {},
      create: { name: 'Auto Restock', owner: newProduce.owner },
    });

    const existingItem = await prisma.shoppingListItem.findFirst({
      where: {
        shoppingListId: shoppingList.id,
        name: newProduce.name,
      },
    });

    if (!existingItem) {
      await prisma.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          name: newProduce.name,
          quantity: newProduce.restockThreshold ?? 1,
          unit: newProduce.unit,
          price: null,
        },
      });
    }
  }

  return  {ok:true};
}

/**
 * Edits an existing produce.
 */
export async function editProduce(
  produce: Prisma.ProduceUpdateInput & {
    id: number;
    location: string;
    storage: string;
    owner: string;
  },
) {
  // Find or create location and storage first
  const location = await prisma.location.upsert({
    where: { name_owner: { name: produce.location as string, owner: produce.owner as string } },
    update: {},
    create: { name: produce.location as string, owner: produce.owner as string, address: null },
  });

  const storage = await prisma.storage.upsert({
    where: { name_locationId: { name: produce.storage as string, locationId: location.id } },
    update: {},
    create: { name: produce.storage as string, locationId: location.id },
  });

  // Handle expiration
  let expiration: Date | Prisma.DateTimeFieldUpdateOperationsInput | null | undefined = null;
  if (produce.expiration) {
    if (produce.expiration instanceof Date) {
      expiration = produce.expiration;
    } else if (typeof produce.expiration === 'string' || typeof produce.expiration === 'number') {
      expiration = new Date(produce.expiration);
    } else {
      expiration = produce.expiration as Prisma.DateTimeFieldUpdateOperationsInput;
    }
  }
 
  // Update produce linking new IDs
  const updatedProduce = await prisma.produce.update({
    where: { id: produce.id },
    data: {
      name: produce.name,
      type: produce.type,
      locationId: location.id,
      storageId: storage.id,
      quantity: produce.quantityValue,
      unit: produce.quantityUnit,
      expiration,
      owner: produce.owner,
      image: produce.image,
      restockThreshold: produce.restockThreshold ?? 0,
    },
  });

  // Auto-add to shopping list if below threshold
  if (updatedProduce.restockThreshold !== null && updatedProduce.quantity <= updatedProduce.restockThreshold) {
    const shoppingList = await prisma.shoppingList.upsert({
      where: { name_owner: { name: 'Auto Restock', owner: updatedProduce.owner } },
      update: {},
      create: { name: 'Auto Restock', owner: updatedProduce.owner },
    });

    const existingItem = await prisma.shoppingListItem.findFirst({
      where: {
        shoppingListId: shoppingList.id,
        name: updatedProduce.name,
      },
    });

    if (!existingItem) {
      await prisma.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          name: updatedProduce.name,
          quantity: updatedProduce.restockThreshold ?? 1,
          unit: updatedProduce.unit,
          price: null,
        },
      });
    }
  }

  return updatedProduce;
}

/**
 * Deletes a produce by id.
 */
export async function deleteProduce(id: number) {
  await prisma.produce.delete({
    where: { id },
  });

  redirect('/view-pantry');
}

export async function getUserProduceByEmail(owner: string) {
  const items: {
    name: string;
    quantityValue: number;
    quantityUnit: QuantityUnit | null;
  }[] = await prisma.produce.findMany({
    where: { owner },
    select: { 
      name: true,
      quantityValue: true,
      quantityUnit: true,
    },
  });

  return items.map((item) => ({
    name: item.name,
    quantity: item.quantityValue,
    unit: item.quantityUnit,
  }));
}

/**
 * Adds a new location.
 */
export async function addLocation(data: { name: string; owner: string; address?: string }) {
  let latitude: number | null = null;
  let longitude: number | null = null;

  if (data.address?.trim()) {
    const coords = await geocodeAddress(data.address);
    latitude = coords?.lat ?? null;
    longitude = coords?.lng ?? null;
  }

  await prisma.location.create({
    data: {
      name: data.name,
      owner: data.owner,
      address: data.address ?? null,
      latitude,
      longitude,
    },
  });
}

/**
 * Adds a new shopping list.
 */
export async function addShoppingList(data: { name: string; owner: string }) {
  const name = data.name.trim();
  const owner = data.owner.trim();

  if (!name) {
    throw new Error('List name cannot be empty.');
  }

  const existing = await prisma.shoppingList.findFirst({
    where: { name, owner },
  });

  if (existing) {
    throw new Error('A list with this name already exists.');
  }

  const newList = await prisma.shoppingList.create({
    data: { name, owner },
    include: { items: true },
  });

  return newList;
}

/**
 * Edits an existing shopping list.
 */
export async function editShoppingList(list: Prisma.ShoppingListUpdateInput & { id: number }) {
  const updatedList = await prisma.shoppingList.update({
    where: { id: list.id },
    data: {
      name: list.name,
      owner: list.owner,
    },
  });

  return updatedList;
}

/**
 * Update a user's budget.
 */
export async function updateBudget(id: number, budget: number) {
  await prisma.user.update({
    where: { id },
    data: { budget: new Prisma.Decimal(budget) },
  });
}

/**
 * Get a user's budget.
 */
export async function getBudgetByUserId(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { budget: true },
  });
  return user?.budget?.toString() || '0';
}

/**
 * Deletes a shopping list and its items.
 */
export async function deleteShoppingList(id: number) {
  await prisma.shoppingListItem.deleteMany({
    where: { shoppingListId: id },
  });

  await prisma.shoppingList.delete({
    where: { id },
  });
}

/**
 * Adds a new item to a shopping list.
 */
export async function addShoppingListItem(data: {
  name: string;
  quantity: number;
  unit?: string;
  price?: number;
  proteinGrams?: number;
  shoppingListId: number;
}) {
  const item = await prisma.shoppingListItem.upsert({
    where: {
      shoppingListId_name: {
        shoppingListId: data.shoppingListId,
        name: data.name,
      },
    },
    create: {
      name: data.name,
      quantityValue: data.quantity, 
      quantityUnit: data.unit || '',
      price: data.price ?? null,
      proteinGrams: data.proteinGrams ?? null,
      shoppingListId: data.shoppingListId,
    },
    update: {
      quantityValue: { increment: data.quantity },
    },
  });
  console.log('✅ Added item to shopping list:', item);
  return {
    ...item,
    price: item.price != null ? Number(item.price.toString()) : null,
  };
}

/**
 * Edits a shopping list item.
 */
export async function editShoppingListItem(
  item: {
    id: number;
    name?: string;
    quantity?: number;
    unit?: string | null;
    price?: number | null;
    restockTrigger?: string | null;
    customThreshold?: number | null;
  },
) {
  const updatedItem = await prisma.shoppingListItem.update({
    where: { id: item.id },
    data: {
      ...(item.name !== undefined && { name: item.name }),
      ...(item.quantity !== undefined && { quantity: item.quantity }),
      ...(item.unit !== undefined && { unit: item.unit }),
      ...(item.price !== undefined && { price: item.price }),
      ...(item.restockTrigger !== undefined && {
        restockTrigger: item.restockTrigger,
      }),
      ...(item.customThreshold !== undefined && {
        customThreshold: item.customThreshold,
      }),
    },
  });

  return {
    ...updatedItem,
    price: updatedItem.price != null ? Number(updatedItem.price.toString()) : null,
  };
}

/**
 * Deletes a shopping list item.
 */
export async function deleteShoppingListItem(id: number) {
  await prisma.shoppingListItem.delete({
    where: { id },
  });
}

/**
 * Creates a shopping list named after a recipe and populates it with the
 * recipe's ingredients as shopping list items. Runs as a single transaction.
 */
export async function createShoppingListFromRecipe(data: {
  owner: string;
  recipeName: string;
  ingredients: { name: string; quantity: number | null; unit: string | null }[];
}) {
  const baseName = data.recipeName.trim();

  // Find a unique list name by appending a counter if needed
  let listName = baseName;
  let counter = 1;
  while (await prisma.shoppingList.findFirst({ where: { name: listName, owner: data.owner } })) {
    listName = `${baseName} (${counter})`;
    counter++;
  }

  return prisma.$transaction(async (tx: { shoppingList: { 
    create: (arg0: { data: { name: string; owner: string; }; }) => any; 
    findUniqueOrThrow: (arg0: { where: { id: any; }; include: { items: boolean; }; }) => any; 
  }; shoppingListItem: { createMany: (arg0: { data: { shoppingListId: any; name: string; 
    quantity: number; unit: string; }[]; }) => any; }; }) => {
    const list = await tx.shoppingList.create({
      data: { name: listName, owner: data.owner },
    });

    if (data.ingredients.length > 0) {
      await tx.shoppingListItem.createMany({
        data: data.ingredients.map((ingredient) => ({
          shoppingListId: list.id,
          name: ingredient.name,
          quantity: ingredient.quantity ?? 1,
          unit: ingredient.unit ?? '',
        })),
      });
    }

    // Return the list with its items so the UI can update without a page reload
    return tx.shoppingList.findUniqueOrThrow({
      where: { id: list.id },
      include: { items: true },
    });
  });
}