"use client"

import DesktopNavbar from '@/components/desktopnav/nav'
import Sidebar from '@/components/desktopsidebar/sidebar'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import MobileNavbar from '@/components/mobilenav/mobilenav'
import MobilebottomNavbar from '@/components/mobilenav/MobileBottomNavbar'

const Page = () => {
  const [formData, setFormData] = useState({
    adminId: '',
    noticeText: '',
    noticeTitle: '',
    noticeStartDate: '',
    noticeEndDate: '',
    batchName: ''
  })

  const [notices, setNotices] = useState([])
  const [editNoticeId, setEditNoticeId] = useState(null)
  const [editNoticeData, setEditNoticeData] = useState({})
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [batchNames, setBatchNames] = useState([]);

  // 🔑 Fetch and decode token on mount
  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded?.id) {
          setFormData(prev => ({ ...prev, adminId: decoded.id }))
          fetchNotices(decoded.id)
        }
      } catch (err) {
        console.error("Invalid token:", err)
      }
    }
  }, [])

  //fetching the batches name using the admin id
  useEffect(()=>{
    const fetchBatches = async()=>{
        const token = localStorage.getItem("adminAuthToken");
        let adminId = "";            
        if(token) {
            try{
                const decoded = jwtDecode(token);
                if(decoded.id) {
                    adminId = decoded.id;
                }
                console.log(adminId);

                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/batchesInfobyId`, {admin_id : adminId});

                if(response.status === 200) {
                    setBatchNames(response.data.batchesName); 
                    
                }else{
                    console.error("Failed to fetch the data",response.data.message);
                }

                
            }catch(error) {
                console.log("error in the frontend", error);
            }
        }
    }
    fetchBatches();
  },[])

  // 🧠 Fetch notices by adminId
  const fetchNotices = async (adminId) => {
    setLoading(true)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/fetch-notice`, { adminId })
      setNotices(res.data.notices)
    } catch (error) {
      console.error('Error fetching notices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!formData.noticeTitle || !formData.noticeText) {
      alert('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/add-notice`, formData)
      setFormData(prev => ({
        ...prev,
        noticeText: '',
        noticeTitle: '',
        noticeStartDate: '',
        noticeEndDate: '',
        batchName: ''
      }))
      setShowCreateForm(false)
      fetchNotices(formData.adminId)
    } catch (error) {
      console.error('Error saving notice:', error)
      alert('Error creating notice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return
    
    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/delete-notice`, { id })
      fetchNotices(formData.adminId)
    } catch (error) {
      console.error('Error deleting notice:', error)
      alert('Error deleting notice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e) => {
    setEditNoticeData({ ...editNoticeData, [e.target.name]: e.target.value })
  }

  const handleEditClick = (notice) => {
    setEditNoticeId(notice.id)
    setEditNoticeData({ ...notice })
  }

  const handleUpdateSubmit = async (id) => {
    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/update-notice`, { id, ...editNoticeData })
      setEditNoticeId(null)
      setEditNoticeData({})
      fetchNotices(formData.adminId)
    } catch (error) {
      console.error('Error updating notice:', error)
      alert('Error updating notice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter notices based on search and batch filter
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.noticeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.noticeText.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBatch = filterBatch === '' || notice.batchName === filterBatch
    return matchesSearch && matchesBatch
  })

  // Get unique batch names for filter dropdown
  const uniqueBatches = [...new Set(notices.map(notice => notice.batchName).filter(Boolean))]

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isNoticeActive = (startDate, endDate) => {
    const today = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return today >= start && today <= end
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <div className='w-50 max-sm:hidden'><Sidebar /></div>
      <div className="hidden max-md:block fixed top-0 left-0 w-full h-16 bg-white shadow-md z-50">
        <MobileNavbar />
        <MobilebottomNavbar />
      </div>
      <div className='flex-1'>
        <DesktopNavbar />
        
        <div className='p-6 max-w-7xl mx-auto ml-10 max-md:ml-0 max-md:max-w-full max-sm:p-2 max-sm:mt-20'>
          {/* Header Section */}
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Notice Management</h1>
                <p className='text-gray-600 mt-1'>Create, manage and organize notices for your batches</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                </svg>
                {showCreateForm ? 'Cancel' : 'Create New Notice'}
              </button>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg text-white transform hover:scale-105 transition-all duration-200'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm text-blue-100'>Total Notices</p>
                    <p className='text-3xl font-bold text-white'>{notices.length}</p>
                  </div>
                </div>
              </div>
              
              <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg text-white transform hover:scale-105 transition-all duration-200'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm text-green-100'>Active Notices</p>
                    <p className='text-3xl font-bold text-white'>
                      {notices.filter(notice => isNoticeActive(notice.noticeStartDate, notice.noticeEndDate)).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg text-white transform hover:scale-105 transition-all duration-200'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm text-purple-100'>Total Batches</p>
                    <p className='text-3xl font-bold text-white'>{uniqueBatches.length}</p>
                  </div>
                </div>
              </div>
              
              <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg text-white transform hover:scale-105 transition-all duration-200'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm text-orange-100'>Ending Soon</p>
                    <p className='text-3xl font-bold text-white'>
                      {notices.filter(notice => {
                        const endDate = new Date(notice.noticeEndDate)
                        const today = new Date()
                        const diffTime = endDate - today
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 7 && diffDays > 0
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Notice Form Modal */}
          {showCreateForm && (
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
              <div className='bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transparent-scrollbar'>
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center'>
                      <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                      </svg>
                    </div>  
                    <h2 className='text-2xl font-bold text-gray-900'>Create New Notice</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </button>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='col-span-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Admin ID</label>
                    <input
                      type='text'
                      name='adminId'
                      value={formData.adminId}
                      onChange={handleChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed'
                      disabled
                    />
                  </div>
                  
                  <div className='col-span-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Batch Name</label>
                    <select
                        name='batchName'
                        value={formData.batchName}
                        onChange={handleChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white'
                    >
                        <option value=''>Select a batch</option>
                        {batchNames.length > 0 ? (
                            batchNames.map((batchName, index) => (
                                <option key={index} value={batchName}>{batchName}</option>
                            ))
                        ) : (
                            <option value="none">None</option>
                        )
                    }
                    </select>
                    </div>

                  
                  <div className='col-span-full'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Notice Title *</label>
                    <input
                      type='text'
                      name='noticeTitle'
                      value={formData.noticeTitle}
                      onChange={handleChange}
                      placeholder='Enter notice title'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    />
                  </div>
                  
                  <div className='col-span-full'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Notice Content *</label>
                    <textarea
                      name='noticeText'
                      value={formData.noticeText}
                      onChange={handleChange}
                      placeholder='Enter notice content...'
                      rows='4'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
                    ></textarea>
                  </div>
                  
                  <div className='col-span-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Start Date</label>
                    <input
                      type='date'
                      name='noticeStartDate'
                      value={formData.noticeStartDate}
                      onChange={handleChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    />
                  </div>
                  
                  <div className='col-span-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>End Date</label>
                    <input
                      type='date'
                      name='noticeEndDate'
                      value={formData.noticeEndDate}
                      onChange={handleChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    />
                  </div>
                </div>
                
                <div className='flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100'>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className='px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {loading ? (
                      <>
                        <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Notice'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6'>
            <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <svg className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                  <input
                    type='text'
                    placeholder='Search notices...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  />
                </div>
              </div>
              
              <div className='flex gap-4'>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                >
                  <option value=''>All Batches</option>
                  {uniqueBatches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notices List */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100'>
            <div className='p-6 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>All Notices ({filteredNotices.length})</h3>
              </div>
            </div>
            
            {loading ? (
              <div className='p-12 text-center'>
                <svg className='animate-spin w-8 h-8 mx-auto mb-4 text-blue-600' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                <p className='text-gray-500'>Loading notices...</p>
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className='p-12 text-center'>
                <svg className='w-12 h-12 mx-auto mb-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No notices found</h3>
                <p className='text-gray-500'>Try adjusting your search or create a new notice.</p>
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {filteredNotices.map((notice) => (
                  <div key={notice.id} className='p-6 hover:bg-gray-50 transition-colors'>
                    {editNoticeId === notice.id ? (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div className='col-span-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Notice Title</label>
                            <input
                              type='text'
                              name='noticeTitle'
                              value={editNoticeData.noticeTitle}
                              onChange={handleEditChange}
                              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                            />
                          </div>
                          
                          <div className='col-span-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Notice Content</label>
                            <textarea
                              name='noticeText'
                              value={editNoticeData.noticeText}
                              onChange={handleEditChange}
                              rows='3'
                              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
                            ></textarea>
                          </div>
                          
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Start Date</label>
                            <input
                              type='date'
                              name='noticeStartDate'
                              value={editNoticeData.noticeStartDate}
                              onChange={handleEditChange}
                              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                            />
                          </div>
                          
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>End Date</label>
                            <input
                              type='date'
                              name='noticeEndDate'
                              value={editNoticeData.noticeEndDate}
                              onChange={handleEditChange}
                              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                            />
                          </div>
                          
                          <div className='col-span-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Batch Name</label>
                            <input
                              type='text'
                              name='batchName'
                              value={editNoticeData.batchName}
                              onChange={handleEditChange}
                              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                            />
                          </div>
                        </div>
                        
                        <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                          <button
                            onClick={() => setEditNoticeId(null)}
                            className='px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateSubmit(notice.id)}
                            disabled={loading}
                            className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                          >
                            {loading ? (
                              <>
                                <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                </svg>
                                Updating...
                              </>
                            ) : (
                              <>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                                </svg>
                                Update Notice
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex justify-between items-start gap-6'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-3'>
                            <h4 className='text-xl font-bold text-gray-900'>{notice.noticeTitle}</h4>
                            {isNoticeActive(notice.noticeStartDate, notice.noticeEndDate) ? (
                              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                Active
                              </span>
                            ) : (
                              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                                Inactive
                              </span>
                            )}
                          </div>
                          
                          <p className='text-gray-700 leading-relaxed mb-4'>{notice.noticeText}</p>
                          
                          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              <span>End: {formatDate(notice.noticeEndDate)}</span>
                            </div>
                            {notice.batchName && (
                              <div className='flex items-center gap-1'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                </svg>
                                <span>Batch: {notice.batchName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleEditClick(notice)}
                            className='inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(notice.id)}
                            className='inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page