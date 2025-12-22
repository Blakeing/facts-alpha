/**
 * entities/case/model/mockData.ts
 *
 * Mock case data for development and testing
 */

import type { Case, CaseStatus } from './case'

const firstNames = [
  'Robert',
  'Eleanor',
  'Thomas',
  'Patricia',
  'James',
  'Mary',
  'John',
  'Elizabeth',
  'William',
  'Sarah',
  'Michael',
  'Jennifer',
  'David',
  'Linda',
  'Richard',
  'Barbara',
  'Joseph',
  'Susan',
  'Charles',
  'Jessica',
  'Daniel',
  'Karen',
  'Matthew',
  'Nancy',
  'Anthony',
  'Lisa',
  'Mark',
  'Betty',
  'Donald',
  'Margaret',
  'Steven',
  'Sandra',
  'Paul',
  'Ashley',
  'Andrew',
  'Kimberly',
  'Joshua',
  'Emily',
  'Kenneth',
  'Donna',
]

const lastNames = [
  'Johnson',
  'Martinez',
  'Anderson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Wilson',
  'Gonzalez',
  'Moore',
  'Jackson',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
  'Adams',
  'Nelson',
]

const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other']
const statuses: CaseStatus[] = ['pending', 'active', 'in_progress', 'completed', 'archived']
const placesOfDeath = [
  'Memorial Hospital',
  'Home',
  "St. Mary's Hospital",
  'Riverside Care Center',
  'Regional Medical Center',
  'Hospice Care',
]
const serviceTypes = ['visitation', 'funeral', 'graveside', 'cremation', 'memorial', 'transport']

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

function generateCase(
  id: number,
  caseNumber: string,
  status: CaseStatus,
  dateOfDeath: string,
): Case {
  const firstName = randomElement(firstNames)
  const lastName = randomElement(lastNames)
  const nextOfKinFirstName = randomElement(firstNames)
  const nextOfKinLastName = randomElement(lastNames)
  const relationship = randomElement(relationships)

  const createdAt = new Date(dateOfDeath)
  createdAt.setHours(8 + Math.floor(Math.random() * 8))
  const updatedAt = new Date(createdAt)
  updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * 5))

  const numServices = Math.floor(Math.random() * 3) + 1
  const services = Array.from({ length: numServices }, (_, i) => ({
    id: `s${id}-${i + 1}`,
    type: randomElement(serviceTypes),
  }))

  return {
    id: String(id),
    caseNumber,
    tenantId: 'default',
    status,
    decedent: {
      firstName,
      lastName,
      middleName: Math.random() > 0.5 ? randomElement(firstNames) : undefined,
      dateOfBirth: randomDate(new Date('1930-01-01'), new Date('1980-12-31')),
      dateOfDeath,
      placeOfDeath: randomElement(placesOfDeath),
      veteranStatus: Math.random() > 0.7,
    },
    nextOfKin: {
      firstName: nextOfKinFirstName,
      lastName: nextOfKinLastName,
      relationship,
      phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email:
        Math.random() > 0.3
          ? `${nextOfKinFirstName.toLowerCase()}.${nextOfKinLastName.toLowerCase()}@email.com`
          : undefined,
      address:
        Math.random() > 0.4
          ? {
              street: `${Math.floor(Math.random() * 9999) + 1} ${randomElement(['Oak', 'Maple', 'Main', 'Elm', 'Park', 'Cedar'])} ${randomElement(['Street', 'Avenue', 'Road', 'Drive'])}`,
              city: randomElement(['Springfield', 'Chicago', 'Peoria', 'Bloomington', 'Normal']),
              state: 'IL',
              zip: `${62_700 + Math.floor(Math.random() * 10)}`,
            }
          : undefined,
    },
    services,
    notes: Math.random() > 0.5 ? `Service notes for ${firstName} ${lastName}.` : undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }
}

// Generate 45 cases with varied statuses and dates
const generatedCases: Case[] = []
let caseNum = 1

// Generate cases for each status
for (const status of statuses) {
  const count =
    status === 'active'
      ? 12
      : status === 'completed'
        ? 15
        : status === 'archived'
          ? 10
          : status === 'in_progress'
            ? 5
            : 3

  for (let i = 0; i < count; i++) {
    const year = 2024
    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    const dateOfDeath = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const caseNumber = `${year}-${String(caseNum).padStart(4, '0')}`

    generatedCases.push(generateCase(caseNum, caseNumber, status, dateOfDeath))
    caseNum++
  }
}

export const mockCases: Case[] = generatedCases
