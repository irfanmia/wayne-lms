export default function Instructions({ exerciseName }: { exerciseName: string }) {
  return (
    <div className="max-w-none">
      <h2 className="text-xl font-bold text-gray-900 mb-4 font-heading">{exerciseName}</h2>
      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Instructions</h3>
      <p className="text-gray-500">
        The classical introductory exercise. Just say &quot;Hello, World!&quot;.
      </p>
      <p className="text-gray-500 mt-2">
        &quot;Hello, World!&quot; is the traditional first program for beginning programming
        in a new language or environment.
      </p>
      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Objectives</h3>
      <ul className="text-gray-500 space-y-1 list-disc list-inside">
        <li>Write a function that returns the string &quot;Hello, World!&quot;</li>
        <li>Make sure all tests pass</li>
        <li>Submit your solution</li>
      </ul>
      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Hints</h3>
      <details className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
        <summary className="text-orange-600 cursor-pointer font-medium">Show hints</summary>
        <ul className="text-gray-500 mt-3 space-y-1 list-disc list-inside">
          <li>Think about what string functions are available</li>
          <li>The function should return a value, not print it</li>
        </ul>
      </details>
    </div>
  );
}
