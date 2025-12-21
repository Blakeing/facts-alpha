/**
 * entities/case/model/mockData.ts
 *
 * Mock case data for development and testing
 */

import type { Case } from './case'

export const mockCases: Case[] = [
  {
    id: '1',
    caseNumber: '2024-0001',
    tenantId: 'default',
    status: 'active',
    decedent: {
      firstName: 'Robert',
      lastName: 'Johnson',
      middleName: 'William',
      dateOfBirth: '1945-03-15',
      dateOfDeath: '2024-12-15',
      placeOfDeath: 'Memorial Hospital',
      veteranStatus: true,
    },
    nextOfKin: {
      firstName: 'Mary',
      lastName: 'Johnson',
      relationship: 'Spouse',
      phone: '555-123-4567',
      email: 'mary.johnson@email.com',
      address: {
        street: '123 Oak Street',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      },
    },
    services: [
      { id: 's1', type: 'visitation' },
      { id: 's2', type: 'funeral' },
      { id: 's3', type: 'graveside' },
    ],
    notes: 'Family requests traditional service with military honors.',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z',
  },
  {
    id: '2',
    caseNumber: '2024-0002',
    tenantId: 'default',
    status: 'pending',
    decedent: {
      firstName: 'Eleanor',
      lastName: 'Martinez',
      dateOfBirth: '1938-07-22',
      dateOfDeath: '2024-12-18',
      placeOfDeath: 'Home',
    },
    nextOfKin: {
      firstName: 'Carlos',
      lastName: 'Martinez',
      relationship: 'Child',
      phone: '555-987-6543',
      email: 'carlos.martinez@email.com',
    },
    services: [
      { id: 's4', type: 'cremation' },
      { id: 's5', type: 'memorial' },
    ],
    notes: 'Cremation followed by memorial service. Family prefers intimate gathering.',
    createdAt: '2024-12-18T09:00:00Z',
    updatedAt: '2024-12-18T09:00:00Z',
  },
  {
    id: '3',
    caseNumber: '2024-0003',
    tenantId: 'default',
    status: 'in_progress',
    decedent: {
      firstName: 'Thomas',
      lastName: 'Anderson',
      middleName: 'James',
      dateOfBirth: '1952-11-08',
      dateOfDeath: '2024-12-17',
      placeOfDeath: 'St. Mary\'s Hospital',
      ssn: '***-**-1234',
    },
    nextOfKin: {
      firstName: 'Susan',
      lastName: 'Anderson',
      relationship: 'Spouse',
      phone: '555-456-7890',
      address: {
        street: '456 Maple Avenue',
        city: 'Springfield',
        state: 'IL',
        zip: '62702',
      },
    },
    services: [
      { id: 's6', type: 'visitation' },
      { id: 's7', type: 'funeral' },
    ],
    createdAt: '2024-12-17T14:00:00Z',
    updatedAt: '2024-12-19T11:00:00Z',
  },
  {
    id: '4',
    caseNumber: '2024-0004',
    tenantId: 'default',
    status: 'completed',
    decedent: {
      firstName: 'Patricia',
      lastName: 'Williams',
      dateOfBirth: '1960-02-14',
      dateOfDeath: '2024-12-10',
      placeOfDeath: 'Riverside Care Center',
    },
    nextOfKin: {
      firstName: 'David',
      lastName: 'Williams',
      relationship: 'Child',
      phone: '555-234-5678',
      email: 'david.williams@email.com',
    },
    services: [
      { id: 's8', type: 'visitation' },
      { id: 's9', type: 'funeral' },
      { id: 's10', type: 'graveside' },
    ],
    notes: 'Service completed. Thank you cards sent to family.',
    createdAt: '2024-12-10T08:00:00Z',
    updatedAt: '2024-12-14T16:00:00Z',
  },
  {
    id: '5',
    caseNumber: '2024-0005',
    tenantId: 'default',
    status: 'archived',
    decedent: {
      firstName: 'James',
      lastName: 'Brown',
      middleName: 'Edward',
      dateOfBirth: '1940-05-20',
      dateOfDeath: '2024-11-25',
      placeOfDeath: 'Home',
      veteranStatus: true,
    },
    nextOfKin: {
      firstName: 'Linda',
      lastName: 'Brown',
      relationship: 'Spouse',
      phone: '555-345-6789',
    },
    services: [
      { id: 's11', type: 'visitation' },
      { id: 's12', type: 'funeral' },
      { id: 's13', type: 'graveside' },
    ],
    notes: 'Military honors provided. Family very satisfied with service.',
    createdAt: '2024-11-25T10:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
]

