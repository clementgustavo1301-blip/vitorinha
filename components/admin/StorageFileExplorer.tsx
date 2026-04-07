"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  FolderIcon, 
  ImageIcon, 
  FileIcon, 
  ChevronLeft, 
  Trash2, 
  CheckSquare, 
  Square,
  Loader2,
  MoreVertical,
  X,
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react'

interface StorageFileExplorerProps {
  bucketId: string
  onClose: () => void
  onDeleteSuccess: () => void
}

interface StorageItem {
  name: string
  id: string | null
  updated_at: string | null
  created_at: string | null
  last_accessed_at: string | null
  metadata: {
    size: number
    mimetype: string
  } | null
}

export default function StorageFileExplorer({ bucketId, onClose, onDeleteSuccess }: StorageFileExplorerProps) {
  const supabase = createClient()
  const [items, setItems] = useState<StorageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [path, setPath] = useState<string[]>([]) // Array of folder names
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [isRecursive, setIsRecursive] = useState(false)
  const [recursiveLoading, setRecursiveLoading] = useState(false)

  const currentPathString = path.join('/')

  const fetchItems = async () => {
    if (isRecursive) {
      await fetchAllRecursive()
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from(bucketId)
        .list(currentPathString, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) throw error
      setItems(data as StorageItem[] || [])
    } catch (err) {
      console.error('Error listing storage:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllRecursive = async () => {
    setLoading(true)
    setRecursiveLoading(true)
    try {
      const listFilesRecursively = async (folderPath: string = ''): Promise<StorageItem[]> => {
        const { data, error } = await supabase.storage.from(bucketId).list(folderPath, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        })
        if (error) throw error

        let allFiles: StorageItem[] = []
        for (const item of data || []) {
          if (!item.metadata) { // Folder
            const subPath = folderPath ? `${folderPath}/${item.name}` : item.name
            const subFiles = await listFilesRecursively(subPath)
            allFiles = [...allFiles, ...subFiles]
          } else { // File
            const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name
            allFiles.push({ ...item, name: fullPath })
          }
        }
        return allFiles
      }

      const files = await listFilesRecursively('')
      setItems(files)
    } catch (err: any) {
      console.error('Error recursive listing:', err)
      alert('Erro ao buscar arquivos recursivamente: ' + err.message)
    } finally {
      setLoading(false)
      setRecursiveLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    setSelectedItems(new Set())
  }, [currentPathString, bucketId, isRecursive])

  const toggleSelect = (itemName: string) => {
    // In recursive/flat mode, item.name IS the full path already
    const fullPath = isRecursive ? itemName : (currentPathString ? `${currentPathString}/${itemName}` : itemName)
    const newSelected = new Set(selectedItems)
    if (newSelected.has(fullPath)) {
      newSelected.delete(fullPath)
    } else {
      newSelected.add(fullPath)
    }
    setSelectedItems(newSelected)
  }

  const handleDelete = async () => {
    if (selectedItems.size === 0) return
    if (!window.confirm(`Deseja realmente excluir ${selectedItems.size} arquivo(s)? Esta ação é irreversível.`)) return

    setDeleting(true)
    try {
      const selectedFilesArray = Array.from(selectedItems)

      // First, remove from storage bucket
      const { error: storageError } = await supabase.storage
        .from(bucketId)
        .remove(selectedFilesArray)

      if (storageError) throw storageError

      // Then, remove corresponding database records to maintain sync
      // This prevents "ghost" records in the patient timeline
      const { error: dbError } = await supabase
        .from('wound_images')
        .delete()
        .in('storage_path', selectedFilesArray)

      if (dbError) {
        console.error('Erro ao sincronizar banco de dados após deleção:', dbError)
      }
      
      setSelectedItems(new Set())
      await fetchItems()
      onDeleteSuccess?.()
    } catch (err: any) {
      console.error('Erro ao excluir:', err)
      alert('Erro ao excluir arquivos. Verifique os logs.')
    } finally {
      setDeleting(false)
    }
  }

  const navigateToFolder = (folderName: string) => {
    setPath([...path, folderName])
  }

  const navigateBack = () => {
    setPath(path.slice(0, -1))
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getPublicUrl = (fileName: string) => {
    const fullPath = currentPathString ? `${currentPathString}/${fileName}` : fileName
    const { data } = supabase.storage.from(bucketId).getPublicUrl(fullPath)
    return data.publicUrl
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Explorer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={path.length > 0 ? navigateBack : onClose}
            className="p-2 rounded-xl bg-white border border-[#A58079]/20 text-[#A58079] hover:bg-[#A58079]/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-[#2D2422] flex items-center gap-2">
               Explorador de Arquivos
               <span className="text-xs px-2 py-0.5 bg-[#A58079]/10 rounded-full font-bold uppercase tracking-wider">{bucketId}</span>
            </h3>
            <div className="flex items-center gap-1 mt-1">
               <span className="text-[10px] uppercase tracking-widest font-bold text-[#A58079]/60">Caminho:</span>
               <span className="text-[10px] font-bold text-[#6B5C59]">{isRecursive ? 'Visualização Global (Todos os arquivos)' : `/ ${path.join(' / ')}`}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={() => setIsRecursive(!isRecursive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all border ${isRecursive ? 'bg-[#A58079] text-white border-[#A58079] shadow-md shadow-[#A58079]/20' : 'bg-[#F9F7F6] text-[#6B5C59] border-[#A58079]/10 hover:bg-white'}`}
          >
            <Layers className="w-4 h-4" />
            {isRecursive ? 'Ver Pastas' : 'Ver Tudo'}
          </button>
          {selectedItems.size > 0 && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Excluir ({selectedItems.size})
            </button>
          )}
          
          <button
             onClick={onClose}
             className="px-4 py-3 rounded-2xl bg-[#F9F7F6] text-[#6B5C59] font-bold text-sm border border-[#A58079]/10 hover:bg-white transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#A58079] animate-pulse">
           <Loader2 className="w-10 h-10 animate-spin mb-4" />
           <span className="text-sm font-bold uppercase tracking-wider">
             {recursiveLoading ? 'Mapeando todas as pastas... (Pode demorar)' : 'Acessando Bucket...'}
           </span>
        </div>
      ) : (
        <div className="neumorph-card overflow-hidden border-[#A58079]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFCFB] border-b border-[#A58079]/10">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B5C59]">{isRecursive ? 'Caminho Completo' : 'Item'}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B5C59]">Tamanho</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B5C59]">Criado em</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A58079]/5 bg-white">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center italic text-[#6B5C59]">
                      Pasta vazia.
                    </td>
                  </tr>
                )}
                {items.map((item) => {
                  const isFolder = !item.metadata
                  const fullPath = currentPathString ? `${currentPathString}/${item.name}` : item.name
                  const isSelected = selectedItems.has(fullPath)
                  
                  return (
                    <tr 
                      key={item.id || item.name} 
                      className={`group transition-colors ${isSelected ? 'bg-red-50/50' : 'hover:bg-[#F9F7F6]'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {!isFolder && (
                            <button onClick={() => toggleSelect(item.name)} className="text-[#A58079] hover:scale-110 transition-all">
                               {isSelected ? <CheckSquare className="w-5 h-5 fill-[#A58079] text-white" /> : <Square className="w-5 h-5" />}
                            </button>
                          )}
                          <div 
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => isFolder ? navigateToFolder(item.name) : null}
                          >
                            <div className={`p-2 rounded-xl ${isFolder ? 'bg-amber-100/50 text-amber-600' : 'bg-blue-100/50 text-blue-600'}`}>
                              {isFolder ? <FolderIcon className="w-5 h-5" /> : (
                                item.metadata?.mimetype?.startsWith('image/') ? <ImageIcon className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#2D2422] group-hover:text-[#A58079] transition-colors max-w-[250px] md:max-w-md truncate">
                                 {item.name}
                               </p>
                               {isFolder && <span className="text-[10px] font-bold text-amber-600/60 uppercase">Pasta</span>}
                               {isRecursive && (
                                  <span className="text-[10px] font-bold text-[#A58079]/60 uppercase flex items-center gap-1">
                                    <FolderIcon className="w-3 h-3" /> {item.name.split('/').slice(0, -1).join(' / ') || 'Raiz'}
                                  </span>
                               )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[#6B5C59]">
                        {isFolder ? '--' : formatSize(item.metadata?.size || 0)}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[#6B5C59]">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '--'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         {!isFolder && (
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a 
                                href={getPublicUrl(item.name)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-lg border border-[#A58079]/10 text-[#6B5C59] hover:text-[#A58079] hover:border-[#A58079]/30 transition-all"
                                title="Abrir arquivo"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                           </div>
                         )}
                         {isFolder && (
                            <ChevronRight className="w-4 h-4 text-[#A58079]/20" />
                         )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Usage Warning */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
         <div className="p-2 bg-white rounded-xl text-amber-600 shadow-sm shrink-0">
            <Trash2 className="w-4 h-4" />
         </div>
         <p className="text-xs text-amber-800 leading-relaxed font-medium">
            **Atenção:** A exclusão de arquivos de fotos vinculadas a prontuários deixará links quebrados nos históricos de evolução. Recomenda-se excluir apenas arquivos duplicados ou backups obsoletos.
         </p>
      </div>
    </div>
  )
}
