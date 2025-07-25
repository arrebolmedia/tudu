'use client'

import { Task, TaskStatus, Priority } from '@/types'
import { TaskItem } from '@/components/tasks/task-item'

interface TaskCardsViewProps {
	tasks: Task[]
	onToggleComplete: (taskId: string, completed: boolean) => void
	onUpdateStatus: (taskId: string, status: TaskStatus) => void
	onUpdateTask: (taskId: string, updates: Partial<Task>) => void
	onDelete: (taskId: string) => void
	onArchive: (taskId: string) => void
	onRestore: (taskId: string) => void
	onCancelDeletion: (taskId: string) => void
}

export function TaskCardsView({
	tasks,
	onToggleComplete,
	onUpdateStatus,
	onUpdateTask,
	onDelete,
	onArchive,
	onRestore,
	onCancelDeletion
}: TaskCardsViewProps) {
	return (
		<div className="space-y-8">
			{tasks.map((task, index) => {
				return (
					<div
						key={`${task.id}-${task.position}-${task.updatedAt?.getTime()}`}
						className="apple-fade-in"
						style={{ 
							animationDelay: `${index * 75}ms`
						}}
					>
						<TaskItem
							task={task}
							onToggleComplete={onToggleComplete}
							onUpdateStatus={onUpdateStatus}
							onUpdateTask={onUpdateTask}
							onDelete={onDelete}
							onArchive={onArchive}
							onRestore={onRestore}
							onCancelDeletion={onCancelDeletion}
						/>
					</div>
				)
			})}
		</div>
	)
}
