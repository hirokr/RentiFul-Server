import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

async function insertLocationData(locations: any[]) {
  for (const location of locations) {
    const { id, country, city, state, address, postalCode, coordinates } =
      location;
    try {
      await prisma.$executeRaw`
        INSERT INTO "Location" ("id", "country", "city", "state", "address", "postalCode", "coordinates") 
        VALUES (${id}, ${country}, ${city}, ${state}, ${address}, ${postalCode}, ST_GeomFromText(${coordinates}, 4326));
      `;
      console.log(`Inserted location for ${city}`);
    } catch (error) {
      console.error(`Error inserting location for ${city}:`, error);
    }
  }
}

async function resetSequence(modelName: string) {
  const quotedModelName = `"${toPascalCase(modelName)}"`;

  // Get max id from the table
  const maxIdResult = await (
    prisma[modelName as keyof PrismaClient] as any
  ).findMany({
    select: { id: true },
    orderBy: { id: 'desc' },
    take: 1,
  });

  if (maxIdResult.length === 0) return;

  const maxId = maxIdResult[0].id;

  // Get the sequence name
  const sequenceNameResult = await prisma.$queryRawUnsafe<any[]>(
    `SELECT pg_get_serial_sequence('${quotedModelName}', 'id') as seq_name;`,
  );
  const sequenceName = sequenceNameResult[0]?.seq_name;
  if (!sequenceName) {
    console.error(`Could not find sequence for ${modelName}`);
    return;
  }

  // Set the sequence value to maxId + 1
  await prisma.$executeRawUnsafe(
    `SELECT setval('${sequenceName}', ${maxId + 1}, false);`,
  );
  console.log(`Reset sequence for ${modelName} to ${maxId + 1}`);
}

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    return toPascalCase(path.basename(fileName, path.extname(fileName)));
  });

  for (const modelName of modelNames.reverse()) {
    const modelNameCamel = toCamelCase(modelName);
    const model = (prisma as any)[modelNameCamel];
    if (!model) {
      console.error(`Model ${modelName} not found in Prisma client`);
      continue;
    }
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function seedUsers() {
  const dataDirectory = path.join(__dirname, 'seedData');

  // Load manager data and add role
  const managerFilePath = path.join(dataDirectory, 'manager.json');
  const managerData = JSON.parse(fs.readFileSync(managerFilePath, 'utf-8'));

  // Load tenant data and add role
  const tenantFilePath = path.join(dataDirectory, 'tenant.json');
  const tenantData = JSON.parse(fs.readFileSync(tenantFilePath, 'utf-8'));

  // Seed managers with MANAGER role
  for (const manager of managerData) {
    try {
      const { image, ...managerWithoutImage } = manager;
      await prisma.user.create({
        data: {
          ...managerWithoutImage,
          role: 'MANAGER',
          profilePicture: image, // Map image to profilePicture
          hasSelectedRole: true, // Existing users have already selected their role
        },
      });
    } catch (error) {
      console.error(`Error seeding manager ${manager.email}:`, error);
    }
  }
  console.log(`Seeded ${managerData.length} managers`);

  // Seed tenants with TENANT role
  for (const tenant of tenantData) {
    try {
      const { image, ...tenantWithoutImage } = tenant;
      await prisma.user.create({
        data: {
          ...tenantWithoutImage,
          role: 'TENANT',
          profilePicture: image, // Map image to profilePicture
          hasSelectedRole: true, // Existing users have already selected their role
        },
      });
    } catch (error) {
      console.error(`Error seeding tenant ${tenant.email}:`, error);
    }
  }
  console.log(`Seeded ${tenantData.length} tenants`);
}

async function main() {
  const dataDirectory = path.join(__dirname, 'seedData');

  const orderedFileNames = [
    'location.json', // No dependencies
    'property.json', // Depends on location and user (manager)
    'lease.json', // Depends on property and user (tenant)
    'application.json', // Depends on property and user (tenant)
    'payment.json', // Depends on lease
  ];

  // Delete all existing data
  await deleteAllData([...orderedFileNames, 'manager.json', 'tenant.json']);

  // Seed locations first
  const locationFilePath = path.join(dataDirectory, 'location.json');
  const locationData = JSON.parse(fs.readFileSync(locationFilePath, 'utf-8'));
  await insertLocationData(locationData);

  // Seed users (consolidated managers and tenants)
  await seedUsers();

  // Seed remaining data
  for (const fileName of orderedFileNames.slice(1)) { // Skip location.json as it's already seeded
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const modelName = toPascalCase(
      path.basename(fileName, path.extname(fileName)),
    );
    const modelNameCamel = toCamelCase(modelName);

    const model = (prisma as any)[modelNameCamel];
    try {
      for (const item of jsonData) {
        await model.create({
          data: item,
        });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
    }

    await sleep(1000);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
