'use client'

import { Task, TaskStatus, Priority } from '@/types'
import { TaskItem } from '@/components/tasks/task-item'
import { Clock, ArrowRight, CheckCircle } from 'lucide-react'

interface TaskKanbanViewProps {
	tasks: Task[]
	onToggleComplete: (taskId: string, completed: boolean) => void
	onUpdateStatus: (taskId: string, status: TaskStatus) => void
	onUpdateTask: (taskId: string, updates: Partial<Task>) => void
	onDelete: (taskId: string) => void
	onArchive: (taskId: string) => void
	onRestore: (taskId: string) => void
	onCancelDeletion: (taskId: string) => void
}

const columns = [
	{
		id: 'PENDING',
		title: 'Pendiente',
		icon: Clock,
		color: 'border-gray-300 bg-gray-50',
		headerColor: 'text-gray-700'
	},
	{
		id: 'IN_PROGRESS',
		title: 'En Progreso',
		icon: ArrowRight,
		color: 'border-blue-300 bg-blue-50',
		headerColor: 'text-blue-700'
	},
	{
		id: 'COMPLETED',
		title: 'Completado',
		icon: CheckCircle,
		color: 'border-green-300 bg-green-50',
		headerColor: 'text-green-700'
	}
]

export function TaskKanbanView({
	tasks,
	onToggleComplete,
	onUpdateStatus,
	onUpdateTask,
	onDelete,
	onArchive,
	onRestore,
	onCancelDeletion
}: TaskKanbanViewProps) {
	const getTasksForColumn = (status: TaskStatus) => {
		return tasks.filter(task => task.status === status)
	}

	return (
		<div className="grid grid-cols-3 gap-6 h-full">
			{columns.map((column) => {
				const columnTasks = getTasksForColumn(column.id as TaskStatus)
				const IconComponent = column.icon

				return (
					<div
						key={column.id}
						className={`flex flex-col rounded-lg border-2 ${column.color} min-h-0`}
					>
						{/* Column Header */}
						<div className="p-4 border-b border-gray-200">
							<div className="flex items-center gap-3">
								<IconComponent size={20} className={column.headerColor} />
								<h3 className={`font-semibold ${column.headerColor}`}>
									{column.title}
								</h3>
								<span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
									{columnTasks.length}
								</span>
							</div>
						</div>

						{/* Column Content */}
						<div className="flex-1 p-4 space-y-4 overflow-y-auto">
							{columnTasks.map((task, index) => {
								return (
									<div
										key={`${task.id}-${task.position}-${task.updatedAt?.getTime()}`}
										className="apple-fade-in"
										style={{ 
											animationDelay: `${index * 50}ms`
										}}
									>
										<div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
											<TaskItem
												task={task}
												onToggleComplete={onToggleComplete}
												onUpdateStatus={onUpdateStatus}
												onUpdateTask={onUpdateTask}
												onDelete={onDelete}
												onArchive={onArchive}
												onRestore={onRestore}
												onCancelDeletion={onCancelDeletion}
												variant="compact"
											/>
										</div>
									</div>
								)
							})}

							{/* Empty State */}
							{columnTasks.length === 0 && (
								<div className="text-center py-8 text-gray-400">
									<IconComponent size={32} className="mx-auto mb-2 opacity-50" />
									<p className="text-sm">No hay tareas</p>
								</div>
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}
