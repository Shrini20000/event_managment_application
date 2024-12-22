import { TaskList } from '../../components/task-list'

export default function TasksPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tasks</h1>
      <TaskList />
    </div>
  )
}

