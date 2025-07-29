"use client"

import React, { useState } from 'react'
import { IoFilterOutline } from 'react-icons/io5'
import { FaPencilAlt } from 'react-icons/fa'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface ManualFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit?: (data: { title: string; description: string }) => void
}

export function ManualFormDialog({ open, onOpenChange, onSubmit }: ManualFormDialogProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            onSubmit?.({ title, description })
            // Reset form
            setTitle('')
            setDescription('')
            onOpenChange(false)
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setTitle('')
        setDescription('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 bg-white">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <FaPencilAlt className="w-4 h-4 text-gray-500" />
                        Project Details (Optional)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Project Title Field */}
                    <div className="space-y-2">
                        <label htmlFor="project-title" className="block text-sm font-medium text-gray-700">
                            Project Title
                        </label>
                        <Input
                            id="project-title"
                            type="text"
                            placeholder="Enter project title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            placeholder="Brief project description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// Filter Icon Component that opens the dialog
export function FilterIcon({ onClick }: { onClick: () => void }) {
    return (
        <IoFilterOutline
            className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
            onClick={onClick}
        />
    )
} 