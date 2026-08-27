// Shared button & input class strings
export const btnPrimary = `
  inline-flex items-center justify-center gap-2
  px-4 py-2.5 text-sm font-semibold rounded-xl
  bg-primary-600 hover:bg-primary-700 active:bg-primary-800
  text-white shadow-sm hover:shadow-md
  transition-all duration-150 disabled:opacity-50
`.trim();

export const btnOutline = `
  inline-flex items-center justify-center gap-2
  px-4 py-2.5 text-sm font-semibold rounded-xl
  border-2 border-gray-200 dark:border-gray-700
  text-gray-700 dark:text-gray-300
  hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400
  transition-all duration-150
`.trim();

export const inputCls = `
  w-full px-3.5 py-2.5 text-sm rounded-xl
  border border-gray-200 dark:border-gray-700
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-white
  placeholder-gray-400 dark:placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
  transition
`.trim();
