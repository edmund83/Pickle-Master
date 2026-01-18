'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  X,
  MapPin,
  User,
  Box,
  HelpCircle,
  FolderOpen,
  Trash2,
  Plus,
  Check,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface OnboardingWizardProps {
  onComplete: () => void
  isModal?: boolean
}

type OrganizationType = 'location' | 'person' | 'category' | 'unsure'

interface FolderSetup {
  name: string
  icon?: string
}

interface ItemSetup {
  name: string
  quantity: number
  folder: string
}

const ORGANIZATION_OPTIONS = [
  {
    id: 'location' as OrganizationType,
    title: 'By Location',
    description: 'Where is it?',
    icon: MapPin,
    folders: ['Warehouse A', 'Warehouse B', 'Office', 'Truck'],
  },
  {
    id: 'person' as OrganizationType,
    title: 'By Person',
    description: 'Who has it?',
    icon: User,
    folders: ['John', 'Sarah', 'Team A', 'Unassigned'],
  },
  {
    id: 'category' as OrganizationType,
    title: 'By Item Category',
    description: 'What type is it?',
    icon: Box,
    folders: ['Electronics', 'Supplies', 'Equipment', 'Miscellaneous'],
  },
  {
    id: 'unsure' as OrganizationType,
    title: "I'm not sure",
    description: 'Help me decide.',
    icon: HelpCircle,
    folders: ['Main Location', 'Storage', 'In Transit'],
  },
]

export default function OnboardingWizard({ onComplete, isModal = true }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [subStep, setSubStep] = useState(1)
  const [organizationType, setOrganizationType] = useState<OrganizationType | null>(null)
  const [folders, setFolders] = useState<FolderSetup[]>([])
  const [items, setItems] = useState<ItemSetup[]>([
    { name: '', quantity: 1, folder: '' },
    { name: '', quantity: 1, folder: '' },
    { name: '', quantity: 1, folder: '' },
  ])
  const [saving, setSaving] = useState(false)

  function handleOrganizationSelect(type: OrganizationType) {
    setOrganizationType(type)
    const option = ORGANIZATION_OPTIONS.find(o => o.id === type)
    if (option) {
      setFolders(option.folders.map(name => ({ name })))
    }
    setSubStep(2)
  }

  function addFolder() {
    setFolders([...folders, { name: '' }])
  }

  function removeFolder(index: number) {
    setFolders(folders.filter((_, i) => i !== index))
  }

  function updateFolder(index: number, name: string) {
    const newFolders = [...folders]
    newFolders[index] = { ...newFolders[index], name }
    setFolders(newFolders)
  }

  function addItem() {
    setItems([...items, { name: '', quantity: 1, folder: folders[0]?.name || '' }])
  }

  function updateItem(index: number, field: keyof ItemSetup, value: string | number) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  async function handleNext() {
    if (step === 1 && subStep === 1) {
      // Already handled by handleOrganizationSelect
      return
    }

    if (step === 1 && subStep === 2) {
      setStep(2)
      // Update items to use first folder as default
      if (folders.length > 0) {
        setItems(items.map(item => ({
          ...item,
          folder: item.folder || folders[0].name
        })))
      }
      return
    }

    if (step === 2) {
      setStep(3)
      return
    }

    // Final step - save and complete
    await saveSetup()
  }

  async function saveSetup() {
    setSaving(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) throw new Error('No tenant found')

      // Create folders
      const validFolders = folders.filter(f => f.name.trim())
      if (validFolders.length > 0) {
         
        await (supabase as any)
          .from('folders')
          .insert(validFolders.map(folder => ({
            tenant_id: profile.tenant_id,
            name: folder.name.trim(),
            parent_id: null,
          })))
      }

      // Get created folders to get their IDs
       
      const { data: createdFolders } = await (supabase as any)
        .from('folders')
        .select('id, name')
        .eq('tenant_id', profile.tenant_id)

      const folderMap = new Map(createdFolders?.map((f: { id: string; name: string }) => [f.name, f.id]) || [])

      // Create items
      const validItems = items.filter(item => item.name.trim())
      if (validItems.length > 0) {
         
        await (supabase as any)
          .from('inventory_items')
          .insert(validItems.map(item => ({
            tenant_id: profile.tenant_id,
            name: item.name.trim(),
            quantity: item.quantity,
            folder_id: folderMap.get(item.folder) || null,
            status: item.quantity > 10 ? 'in_stock' : item.quantity > 0 ? 'low_stock' : 'out_of_stock',
          })))
      }

      // Mark onboarding as complete (update profile or tenant)
       
      await (supabase as any)
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      onComplete()
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving onboarding:', error)
      alert('Failed to save setup. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    if (step === 2) {
      setStep(1)
      setSubStep(2)
    } else if (step === 3) {
      setStep(2)
    } else if (step === 1 && subStep === 2) {
      setSubStep(1)
    }
  }

  const content = (
    <div className="p-10">
      {/* Step 1.1: Choose Organization Type */}
      {step === 1 && subStep === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-neutral-900">Let&apos;s create your main folders</h2>
            <p className="text-neutral-500">
              How is your inventory organized right now? Think about how you naturally group things.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ORGANIZATION_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => handleOrganizationSelect(option.id)}
                  className="flex items-center gap-4 p-5 border-2 border-neutral-100 rounded-xl text-left hover:border-primary/60 hover:bg-primary/10/50 transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">{option.title}</h4>
                    <p className="text-sm text-neutral-400">{option.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 1.2: Customize Folders */}
      {step === 1 && subStep === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-neutral-900">Customize your folders</h2>
            <p className="text-neutral-500">
              Rename or add more folders based on your organization style.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Folder List */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Main Folder Names
              </p>
              {folders.map((folder, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    value={folder.name}
                    onChange={(e) => updateFolder(index, e.target.value)}
                    placeholder="Folder name..."
                    className="flex-1"
                  />
                  <button
                    onClick={() => removeFolder(index)}
                    className="text-neutral-300 hover:text-red-500 transition-colors"
                    disabled={folders.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFolder}>
                <Plus className="h-4 w-4 mr-2" />
                Add Folder
              </Button>
            </div>

            {/* Preview */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider text-center">
                Folder Preview
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-primary font-semibold text-sm">
                  <FolderOpen className="h-4 w-4 text-accent" fill="oklch(95% 0.08 85.79)" />
                  <span>All Items</span>
                </div>
                <div className="ml-6 space-y-2 border-l-2 border-neutral-200 pl-4">
                  {folders.filter(f => f.name.trim()).map((folder, index) => (
                    <div key={index} className="flex items-center gap-2 text-neutral-500 text-sm">
                      <FolderOpen className="h-3 w-3 text-accent" fill="oklch(95% 0.08 85.79)" />
                      <span>{folder.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Add Items */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold text-neutral-900">Add some items to your folders</h2>
            <p className="text-neutral-500">
              More details like custom fields and tags can be added later.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-neutral-100 bg-neutral-50">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Item Name</span>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Quantity</span>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Folder</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 items-center">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Item name..."
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                  <select
                    value={item.folder}
                    onChange={(e) => updateItem(index, 'folder', e.target.value)}
                    className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm"
                  >
                    {folders.filter(f => f.name.trim()).map((folder, i) => (
                      <option key={i} value={folder.name}>{folder.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-3 max-w-md">
            <h2 className="text-3xl font-bold text-neutral-900">Great Start!</h2>
            <p className="text-neutral-500">
              With your folders set up, you&apos;re ready to build your searchable inventory system.
              The more you add, the more powerful StockZip becomes.
            </p>
          </div>

          <div className="w-full max-w-md text-left space-y-4 py-6 border-y border-neutral-100">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Your next moves:
            </p>
            <div className="space-y-3">
              {[
                'Add more folders and items',
                'Add photos and details on item pages',
                'Try the Search feature to find items instantly',
              ].map((move, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{move}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const footer = (
    <div className="flex items-center justify-between px-10 py-6 border-t border-neutral-100 bg-white">
      <span className="text-sm text-neutral-400">
        Step {step} of 3
      </span>
      <div className="flex items-center gap-4">
        {(step > 1 || subStep > 1) && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={handleNext} disabled={step === 1 && subStep === 2 && folders.filter(f => f.name.trim()).length === 0}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'View My Workspace'
            )}
          </Button>
        )}
      </div>
    </div>
  )

  if (!isModal) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {content}
          {footer}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm" />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button
          onClick={onComplete}
          className="absolute top-6 right-6 text-neutral-300 hover:text-neutral-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {content}
        {footer}
      </div>
    </div>
  )
}
