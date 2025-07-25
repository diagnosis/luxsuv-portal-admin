
import './App.css'
import Navbar from "./components/Navbar.jsx";

function App() {


  return (
    <>
      <div className='App bg-gray-900 min-h-screen text-white'>
          <Navbar></Navbar>
          <div className='p-6'>
              <h1 className='bg-blue-500 text-3xl font-bold p-4 rounded mb-6'>
                  LuxSUV Admin / Dispatcher Portal
              </h1>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <div className='bg-white p-4 rounded-lg shadow-md text-black'>Item 1</div>
                  <div className='bg-white p-4 rounded-lg shadow-md text-black'>Item 2</div>
                  <div className='bg-white p-4 rounded-lg shadow-md text-black'>Item 3</div>
              </div>
          </div>

      </div>

    </>
  )
}

export default App
