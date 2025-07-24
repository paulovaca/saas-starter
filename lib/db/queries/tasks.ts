import { db } from '@/lib/db/drizzle';
import { clientTasks, clientsNew } from '../schema/clients';
import { users } from '../schema/users';
import { eq, and } from 'drizzle-orm';

interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  assignedTo: string;
  notifyAssignee?: boolean;
}

export async function createTask(
  taskData: CreateTaskData,
  clientId: string,
  createdById: string,
  agencyId: string
) {
  // Verify client exists and belongs to the agency
  const client = await db.query.clientsNew.findFirst({
    where: and(
      eq(clientsNew.id, clientId),
      eq(clientsNew.agencyId, agencyId)
    ),
  });

  if (!client) {
    throw new Error('Cliente não encontrado ou não pertence à sua agência');
  }

  // Verify assigned user belongs to same agency
  const assignedUser = await db.query.users.findFirst({
    where: and(
      eq(users.id, taskData.assignedTo),
      eq(users.agencyId, agencyId),
      eq(users.isActive, true)
    ),
  });

  if (!assignedUser) {
    throw new Error('Usuário responsável não encontrado ou não pertence à sua agência');
  }

  // Create task
  const [newTask] = await db.insert(clientTasks).values({
    clientId,
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    status: 'pending',
    dueDate: taskData.dueDate,
    assignedTo: taskData.assignedTo,
    createdBy: createdById,
  }).returning();

  // Get task with user details
  const taskWithUser = await db
    .select({
      id: clientTasks.id,
      title: clientTasks.title,
      description: clientTasks.description,
      priority: clientTasks.priority,
      status: clientTasks.status,
      dueDate: clientTasks.dueDate,
      assignedTo: clientTasks.assignedTo,
      createdBy: clientTasks.createdBy,
      createdAt: clientTasks.createdAt,
      assignedUser: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(clientTasks)
    .leftJoin(users, eq(clientTasks.assignedTo, users.id))
    .where(eq(clientTasks.id, newTask.id))
    .limit(1);

  return taskWithUser[0];
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  userId: string,
  agencyId: string
) {
  // First verify the task exists and user has access
  const task = await db
    .select({
      id: clientTasks.id,
      clientId: clientTasks.clientId,
      assignedTo: clientTasks.assignedTo,
      createdBy: clientTasks.createdBy,
    })
    .from(clientTasks)
    .leftJoin(clientsNew, eq(clientTasks.clientId, clientsNew.id))
    .where(and(
      eq(clientTasks.id, taskId),
      eq(clientsNew.agencyId, agencyId)
    ))
    .limit(1);

  if (!task || task.length === 0) {
    throw new Error('Tarefa não encontrada ou não pertence à sua agência');
  }

  // Check if user has permission to update this task
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true }
  });

  const canUpdate = currentUser?.role === 'MASTER' || 
                   currentUser?.role === 'ADMIN' || 
                   task[0].assignedTo === userId || 
                   task[0].createdBy === userId;

  if (!canUpdate) {
    throw new Error('Você não tem permissão para alterar esta tarefa');
  }

  // Update the task status
  const updateData: any = {
    status: newStatus,
    updatedAt: new Date(),
  };

  // If marking as completed, set completedAt
  if (newStatus === 'completed') {
    updateData.completedAt = new Date();
  } else {
    // If changing from completed to other status, clear completedAt
    updateData.completedAt = null;
  }

  const [updatedTask] = await db
    .update(clientTasks)
    .set(updateData)
    .where(eq(clientTasks.id, taskId))
    .returning();

  // Return task with user details
  const taskWithUser = await db
    .select({
      id: clientTasks.id,
      title: clientTasks.title,
      description: clientTasks.description,
      priority: clientTasks.priority,
      status: clientTasks.status,
      dueDate: clientTasks.dueDate,
      assignedTo: clientTasks.assignedTo,
      createdBy: clientTasks.createdBy,
      createdAt: clientTasks.createdAt,
      completedAt: clientTasks.completedAt,
      updatedAt: clientTasks.updatedAt,
      assignedUser: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(clientTasks)
    .leftJoin(users, eq(clientTasks.assignedTo, users.id))
    .where(eq(clientTasks.id, taskId))
    .limit(1);

  return taskWithUser[0];
}

export async function getTasksByClient(clientId: string, userId: string, agencyId: string) {
  // Verify client exists and belongs to the agency
  const client = await db.query.clientsNew.findFirst({
    where: and(
      eq(clientsNew.id, clientId),
      eq(clientsNew.agencyId, agencyId)
    ),
  });

  if (!client) {
    throw new Error('Cliente não encontrado ou não pertence à sua agência');
  }

  return await db
    .select({
      id: clientTasks.id,
      title: clientTasks.title,
      description: clientTasks.description,
      priority: clientTasks.priority,
      status: clientTasks.status,
      dueDate: clientTasks.dueDate,
      assignedUser: {
        name: users.name,
      },
    })
    .from(clientTasks)
    .leftJoin(users, eq(clientTasks.assignedTo, users.id))
    .where(eq(clientTasks.clientId, clientId))
    .orderBy(clientTasks.dueDate);
}