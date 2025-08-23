'use client'

import { Button } from '@/components/ui/button'
import { useLoading } from '@/hooks/use-loading'

export function LoadingButtonExamples() {
  const saveLoading = useLoading()
  const deleteLoading = useLoading()
  const submitLoading = useLoading()

  const handleSave = async () => {
    await saveLoading.withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Saved!')
    })
  }

  const handleDelete = async () => {
    await deleteLoading.withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Deleted!')
    })
  }

  const handleSubmit = async () => {
    await submitLoading.withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      console.log('Submitted!')
    })
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Loading Button Examples</h2>
      
      <div className="flex gap-4">
        <Button 
          onClick={handleSave}
          loading={saveLoading.loading}
          loadingText="Saving..."
        >
          Save Changes
        </Button>

        <Button 
          variant="destructive"
          onClick={handleDelete}
          loading={deleteLoading.loading}
          loadingText="Deleting..."
        >
          Delete Item
        </Button>

        <Button 
          variant="outline"
          onClick={handleSubmit}
          loading={submitLoading.loading}
          loadingText="Submitting..."
        >
          Submit Form
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        <p>Click the buttons above to see loading states in action.</p>
        <p>The buttons will be disabled and show a spinner while "processing".</p>
      </div>
    </div>
  )
}