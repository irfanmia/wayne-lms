'use client';

interface Student {
  user_id: number;
  username: string;
  email: string;
  progress: number;
  enrolled_at: string;
}

interface StudentTableProps {
  students: Student[];
  onRemove?: (userId: number) => void;
}

export default function StudentTable({ students, onRemove }: StudentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            <th className="py-3 px-4">Student</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Progress</th>
            <th className="py-3 px-4">Enrolled</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.user_id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{s.username}</td>
              <td className="py-3 px-4 text-sm text-gray-500">{s.email}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{Math.round(s.progress)}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">
                {new Date(s.enrolled_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                {onRemove && (
                  <button
                    onClick={() => onRemove(s.user_id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan={5} className="py-8 text-center text-gray-400">No students enrolled</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
