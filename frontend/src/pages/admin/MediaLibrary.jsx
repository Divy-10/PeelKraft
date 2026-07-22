import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiTrash2, FiCopy, FiPlus, FiFolder, FiFileText, FiVideo, FiImage } from 'react-icons/fi';
import { mediaApi } from '../../api';

const MediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState('general');
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const [mediaRes, foldersRes] = await Promise.all([
        mediaApi.getAll({ folder: activeFolder }),
        mediaApi.getFolders()
      ]);
      setMedia(mediaRes.data || []);
      setFolders(foldersRes.data || ['general']);
    } catch (err) {
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [activeFolder]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', activeFolder);

    try {
      await mediaApi.upload(formData);
      toast.success('File uploaded successfully!');
      fetchMedia();
    } catch (err) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await mediaApi.createFolder({ name: newFolderName.trim().toLowerCase() });
      toast.success('Folder created!');
      setActiveFolder(newFolderName.trim().toLowerCase());
      setNewFolderName('');
      setShowFolderModal(false);
      fetchMedia();
    } catch (err) {
      toast.error('Failed to create folder');
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media file permanently?')) return;
    try {
      await mediaApi.delete(id);
      toast.success('Media file deleted');
      fetchMedia();
    } catch (err) {
      toast.error(err.message || 'Failed to delete file');
    }
  };

  const getFileIcon = (type) => {
    if (type === 'video') return <FiVideo className="w-8 h-8 text-blue-500" />;
    if (type === 'pdf') return <FiFileText className="w-8 h-8 text-red-500" />;
    return <FiImage className="w-8 h-8 text-emerald-500" />;
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Folder sidebar */}
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6 self-start">
        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
          <h3 className="font-poppins font-bold text-dark text-base">Folders</h3>
          <button
            onClick={() => setShowFolderModal(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-primary-500 transition-colors"
            title="Create Folder"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold capitalize transition-all ${
                activeFolder === folder
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FiFolder className="w-5 h-5 shrink-0" />
              <span className="truncate">{folder}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Library View */}
      <div className="lg:col-span-3 space-y-6">
        {/* Upload header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
          <h3 className="font-poppins font-bold text-dark text-lg capitalize">{activeFolder} Files</h3>
          <div className="relative">
            <button
              disabled={uploading}
              className="btn-primary py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm text-white disabled:opacity-50"
            >
              <FiUploadCloud className="w-5 h-5" /> {uploading ? 'Uploading...' : 'Upload File'}
            </button>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Gallery grid */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-40">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FiUploadCloud className="w-16 h-16 text-gray-200 mb-4 animate-pulse-soft" />
              <p className="text-sm">No files uploaded in this folder yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {media.map((file) => (
                <div key={file._id} className="group relative rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-gray-50 flex flex-col h-48 hover:shadow transition-shadow">
                  {/* Thumbnail / Icon preview */}
                  <div className="flex-1 flex items-center justify-center overflow-hidden border-b border-gray-100 bg-white">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>

                  {/* Asset info */}
                  <div className="p-3 bg-white shrink-0 space-y-1">
                    <p className="text-xs font-semibold text-dark truncate" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-mono">{file.format} • {(file.size / 1024).toFixed(1)} KB</p>
                  </div>

                  {/* Absolute hover utility buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(file.url)}
                      className="p-2.5 bg-white text-dark hover:bg-primary-500 hover:text-white rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="p-2.5 bg-white text-dark hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                      title="Delete Asset"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-gray-100 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-dark text-base">Create Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder Name (e.g. recipes)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm font-inter"
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 rounded-xl text-xs font-semibold text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
