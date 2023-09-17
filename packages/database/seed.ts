import { Prisma, PrismaClient } from '@prisma/client';

const queue = [...Prisma.dmmf.datamodel.models];

const prisma = new PrismaClient();

const decapitalize = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);

const seed = async () => {
  while (queue.length) {
    const model = queue.shift();

    if (!model) break;

    // get data for current model from json
    let generated = [];
    let staticData = [];
    try {
      generated = require(`./seeds/data/${model.name}.json`);
      staticData = require(`./seeds/data/${model.name}_static.json`);
    } catch (e) {}

    const data = [...staticData, ...generated];

    const firstItem = data[0];
    let relations = [] as string[];

    // take required relations from seed json's
    if (firstItem) {
      relations = Object.keys(firstItem).reduce((relations, dataKey) => {
        const value = firstItem[dataKey];
				//@ts-ignore
        if (typeof value.type === 'string') return [...relations, value.type];
        return relations;
      }, [] as string[]);
    }

    // is some of required relations is still in queue, so not yet populated
    const relationRequired = relations.some((relation) => {
      //@ts-ignore
      return queue.map((model) => model.name).includes(relation.split('.')[0]);
    });

    if (relationRequired) {
      // if there is lack or required relations, push model back to the end of the queue and skip the rest of iteration
      queue.push(model);
      continue;
    }

    console.log('seeding', model.name);

    // take existing relations from the database and push them to array. e.g. [[...addressRecords], [...productRecords], ...]
    const relationsData = await Promise.all(
      relations.map(async (relation) => {
        const key = decapitalize(relation).split('.')[0] as keyof typeof prisma;
        try {
          return (prisma[key] as any).findMany({});
        } catch (e) {
          console.log('error for key:', key);
          throw e;
        }
      })
    );

    // map relations records arrays to apppropriate model names. e.g. { Address: [...addressRecords], Product: [...productRecords] }
    const relationsMap = relations.reduce((relationsMap, relation, index) => {
      return {
        ...relationsMap,
        //@ts-ignore
        [relation.split('.')[0]]: relationsData[index],
      };
    }, {} as { [key: string]: any[] });

    // extract needed relations for each item and write to the database
    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      const relations = Object.keys(item).reduce((relations, fieldName) => {
				
        if (item[fieldName].type) {
          const type = item[fieldName].type.split('.')[0];
          const relationField = item[fieldName].type.split('.')[1] || 'id';
          //@ts-ignore
          const relationData: any[] = relationsMap[type];

          let index = i % relationData.length;
          if (item[fieldName].where) {
            const where = item[fieldName].where;
            index = relationData.findIndex((item) => {
              return Object.keys(where).every((key) => item[key] === where[key]);
            });
          }

          return {
            ...relations,
            [fieldName]: relationData[index][relationField],
          };
        }
        return relations;
      }, {});

      const key = decapitalize(model.name) as keyof typeof prisma;

      try {
        await (prisma[key] as any).create({
          data: {
            ...item,
            ...relations,
          },
        });
      } catch (e) {
        // If we log each seed item, it will slow down the process a lot, so we log only the error
        console.error('\x1b[31m%s\x1b[0m', 'error creating seed record for key: ', key);
        console.error('\x1b[31m%s\x1b[0m', 'error creating seed record for item: ', item);
        throw e;
      }
    }
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
