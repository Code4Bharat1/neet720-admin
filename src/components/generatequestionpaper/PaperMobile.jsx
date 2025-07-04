



"use client"
import { FaChevronCircleLeft } from "react-icons/fa";
import { useState } from "react";
import { IoIosArrowBack } from 'react-icons/io';
import { FaSearch } from "react-icons/fa";  // Import the search icon


export default function PaperMobile() {
    const [formData, setFormData] = useState({
        duration: "",
        marks: "",
        date: "",
        instruction: "",
        batch: "",
    });

    const [submittedData, setSubmittedData] = useState(null);

    // Function to handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Function to handle form submission
    const handleProceed = () => {
        setSubmittedData(formData); // Store data to show in Print Preview
    };

    return (
        <>
            <div className="overflow-hidden">
                
                <div className="flex px-6 w-full relative mt-10">
                    {/* Icon on the Left - Hidden on Mobile */}
                    {/* <div className="text-blue-700 text-3xl ml-100 mt-5 hidden md:block">
                        <FaChevronCircleLeft className="drop-shadow-lg shadow-black bg-transparent fill-current"/>
                    </div> */}


                       <div className="relative left-94">
                          {/* Top Left Blue Button */}
                          <div className=" top-4 hidden md:block" >
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-full shadow-lg flex items-center justify-center">
                              <IoIosArrowBack size={15} />
                            </button>
                          </div>
                        </div>
                    

                    {/* Generate Button Centered - Hidden on Mobile */}
                    <div className="ml-180 justufy-between items-center  hidden md:block">
                        <button className="px-10 py-5 text-gray-400 font-light border-1  border-gray-100 rounded-lg hover:bg-gray-100 shadow-md text-sm md:text-base">
                            Generate Test
                        </button>
                    </div>
                </div>


                    {/* Search Bar */}
                  <div className="flex justify-center mt-4">
                    <div className="relative w-100 max-w-md justify-center mx-4 ">
                      <input
                        type="text"
                        placeholder="Search Tests"
                        className=" w-full px-4 py-3 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#F5F7FA] font-medium text-xl "
                      />
                      <div className="bg-[#007AFF] left-3 top-1/2 transform -translate-y-1/2">
                        <FaSearch className="h-5 w-4 text-gray-400 font-medium" />
                      </div>
                    </div>
                  </div>







                {/* Form Container */}
                <div className="bg-white p-6  w-full md:w-2/3 md:ml-100  mt-10 ml-4  max-w-[calc(100%-2rem)]  shadow-[0_2px_6px_rgba(0,0,0,0.1)] shadow-gray-400 ">
                    <h2 className="font-medium mb-4 text-xl">Details to Generate Test</h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            name="duration"
                            placeholder="Question Paper Duration"
                            className="w-full p-2 border border-gray-600 rounded mt-2 text-xl"
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="marks"
                            placeholder="Question Paper Marks"
                            className="w-full p-2 border border-gray-600 rounded mt-4 text-xl"
                            onChange={handleChange}
                        />
                        <input
                            type="date"
                            name="date"
                            className="w-full p-2 border border-gray-600 rounded mt-4 text-xl text-gray-500 font-medium"
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="instruction"
                            placeholder="Instruction for candidate"
                            className="w-full p-2 border border-gray-600 rounded mt-4 text-xl"
                            onChange={handleChange}
                        />
                        <p className="mt-4 text-gray-500  text-medium font-semibold text-xl">Candidate Detail Feild</p>
                        <select
                            name="batch"
                            className="w-full p-2 border border-gray-600 rounded mt-0 text-xl text-gray-500 font-bold"
                            onChange={handleChange}
                        >
                            <option value="">Batch No</option>
                            <option value="Batch 1">Batch 1</option>
                            <option value="Batch 2">Batch 2</option>
                        </select>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-center  gap-4 mt-6 ">
                    <button
                        className="bg-[#007AFF] text-white px-14 py-2 text-xl rounded ml-14 "
                        onClick={handleProceed}
                    >
                        Proceed
                    </button>
                    <button className="bg-[#F93535] text-white px-14 py-2 text-xl rounded mr-14">
                        Close
                    </button>
                </div>

                {/* Print Preview */}
                <div className="flex flex-col  w-full md:w-1/2  px-10 md:px-0  justify-center items-center mt-6 mb-20 ">
                    <h3 className="font-bold italic mb-3 self-start ml-0 md:ml-[34rem]">Print Preview</h3>
                    <div className="border-4 border-gray-400 border-dashed w-full  h-50 flex flex-col items-center justify-center pl-4 pt-4 mb-4 ml-0 md:ml-[67rem] bg-gray-50">
                        {submittedData ? (
                            <div>
                                <p><strong>Duration:</strong> {submittedData.duration}</p>
                                <p><strong>Marks:</strong> {submittedData.marks}</p>
                                <p><strong>Date:</strong> {submittedData.date}</p>
                                <p><strong>Instruction:</strong> {submittedData.instruction}</p>
                                <p><strong>Batch:</strong> {submittedData.batch}</p>
                            </div>
                        ) : (
                            <p></p>
                        )}
                    </div>

                    <button className="bg-[#F93535] text-white w-full py-2 text-lg rounded ml-0 md:ml-[67rem]">
                        Print
                    </button>
                </div>
            </div>
        </>
    );
}


