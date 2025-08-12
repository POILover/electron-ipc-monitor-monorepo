import { faker } from '@faker-js/faker';

function randomValue(): any {
  const types = ['string', 'number', 'boolean', 'object']
  const type = types[Math.floor(Math.random() * types.length)]

  switch (type) {
    case 'string':
      return faker.lorem.word()
    case 'number':
      return faker.number.int({ min: 0, max: 1000 })
    case 'boolean':
      return faker.datatype.boolean(0.5)
    case 'object':
      return generateRandomJson(Math.random() * 2)
  }
}

export function generateRandomJson(depth = 1): Record<string, any> {
  const obj: Record<string, any> = {}
  const fieldCount = Math.floor(Math.random() * 5) + 1
  for (let i = 0; i < fieldCount; i++) {
    obj[faker.lorem.word()] = depth > 0 ? randomValue() : faker.lorem.word()
  }
  return obj
}


function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomPromise(): Promise<any> {
  const delay = getRandomInt(0, 2000)
  const shouldResolve = Math.random() < 0.8

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldResolve) {
        resolve(generateRandomJson(2))
      } else {
        reject(new Error('Random rejection occurred'))
      }
    }, delay)
  })
}