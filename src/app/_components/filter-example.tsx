"use client"

import React, { useState } from 'react'
import { FilterIcon, ManualFormDialog } from './manual-form-dialog'

export function FilterExample() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleFormSubmit = async (data: { title: string; description: string }) => {
        console.log('Form submitted:', data)
        // Here you can handle the form data
        // For example, send it to your API, update state, etc.
    }

    return (
        <div className="flex items-center gap-4">
            {/* Your existing content */}
            <div className="text-lg">Your content here</div>

            {/* Filter Icon that opens the dialog */}
            <FilterIcon onClick={() => setIsDialogOpen(true)} />

            {/* Manual Form Dialog */}
            <ManualFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleFormSubmit}
            />
        </div>
    )
} 