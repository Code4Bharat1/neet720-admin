"use client";

import React from "react";

const ProfileCardmobile = () => {
  return (
    <div className="block sm:hidden max-w-[100%] mx-auto p-6 bg-white rounded-lg relative">

      {/* Profile Header */}
      <div className="flex justify-center space-x-6">
        <div className="relative -mt-12">
          {/* Red Background Circle */}
          <div className="bg-[#007AFF] inset-0 bg-[#FE5C73] rounded-full transform scale-100 z-0" />
          {/* Profile Image */}
          <img
            src="/userprofile.svg" // Replace with your image URL
            alt="Profile Picture"
            className="w-20 h-20 sm:w-35 sm:h-35 pr-3 rounded-full object-cover relative z-10 drop-shadow-lg"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-6 space-y-4">
        <div className="flex justify-between space-x-4">
          <div className="w-1/2">
            <label className="block text-gray-600 font-bold">First Name</label>
            <input
              type="text"
              className="mt-1 p-2 w-full border text-white border-gray-300 font-semi italic rounded-md bg-[#007AFF]"
              value="Ayaan"
              readOnly
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-600 font-bold">Last Name</label>
            <input
              type="text"
              className="mt-1 p-2 w-full italic border text-white font-semi rounded-md bg-[#007AFF]"
              value="Raje"
              readOnly
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-gray-600 font-bold">E-mail ID</label>
            <input
              type="email"
              className="mt-1 p-2 w-full border text-white border-gray-300 font-semi italic rounded-md bg-[#007AFF]"
              value="ayaanraje25@gmail.com"
              readOnly
            />
          </div>

          <div className="w-full sm:w-1/2">
            <label className="block text-gray-600 font-bold">Phone Number</label>
            <input
              type="tel"
              className="mt-1 p-2 w-full border text-white border-gray-300 italic font-semi rounded-md bg-[#007AFF]"
              value="+91 9920892689"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardmobile;
