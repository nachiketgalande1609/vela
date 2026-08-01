import 'server-only'
import { prisma } from './prisma'
import type { Role } from '@prisma/client'

export type CreateUserInput = {
  email: string
  name?: string
  password?: string
  role?: Role
}

export async function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      name: data.name,
      password: data.password,
      role: data.role ?? 'USER',
    },
    select: { id: true, email: true, name: true, role: true },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function updateUser(id: string, data: Partial<{
  name: string
  password: string
  emailVerified: Date
  failedLoginAttempts: number
  lockedUntil: Date | null
}>) {
  return prisma.user.update({ where: { id }, data })
}

export async function incrementFailedLoginAttempts(id: string) {
  return prisma.user.update({
    where: { id },
    data: { failedLoginAttempts: { increment: 1 } },
  })
}

export async function lockUser(id: string, until: Date) {
  return prisma.user.update({
    where: { id },
    data: { lockedUntil: until, failedLoginAttempts: 0 },
  })
}

export async function resetLoginAttempts(id: string) {
  return prisma.user.update({
    where: { id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  })
}
