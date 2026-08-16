import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listTools, createTool, updateTool, deleteTool, uploadImage } from '@/api/toolsClient';
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Edit2, Trash2, Globe, Search, RefreshCw, LogOut, Check, X, 
  Tag, FileText, Link2, Image, AlertCircle, LayoutGrid, CheckSquare, 
  Sparkles, Key, CheckCircle, ArrowLeft, ArrowUpRight, Loader2, Info, Shield
} from 'lucide-react';

const AVAILABLE_CATEGORIES = [
  'Thiết kế',
  'AI',
  'Năng suất',
  'Lập trình',
  'Plugin Figma',
  'Marketing',
  'Extension',
  'Video & Audio',
  'SEO & Analytics',
  'Repo GitHub',
  'Khác'
];

const INITIAL_FORM_STATE = {
  name: '',
  tagline: '',
  description: '',
  pricing_type: 'Free',
  link: '',
  logo_url: '',
  gallery_images: '',
  referral_offer: '',
  pros: '',
  is_featured: false,
  is_best_choice: false,
  status: 'approved',
  categories: [],
};

function ImageUploadInput({ label, id, name, value, onChange, placeholder, disabled }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);
  const { toast } = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi định dạng',
        description: 'Vui lòng chỉ tải lên các file hình ảnh.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadImage(file);
      onChange({ target: { name, value: publicUrl } });
      toast({
        title: 'Tải ảnh lên thành công',
        description: 'Đã lưu ảnh vào Cloudflare R2.',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Lỗi tải ảnh lên',
        description: err.message || 'Không thể upload ảnh. Kiểm tra cấu hình R2 upload proxy (VITE_R2_UPLOAD_PROXY_URL / VITE_R2_UPLOAD_TOKEN).',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-slate-300">{label}</label>
        {value && (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-mono"
          >
            Xem ảnh gốc <ArrowUpRight className="w-2.5 h-2.5" />
          </a>
        )}
      </div>

      <div 
        className={cn(
          "relative rounded-lg border border-dashed transition-all duration-250 p-1 bg-slate-900/30",
          dragActive ? "border-primary bg-primary/5" : "border-slate-800 hover:border-slate-700",
          isUploading && "opacity-60 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          {/* URL Input */}
          <div className="flex-1 w-full relative">
            <Input 
              id={id}
              name={name}
              type="text"
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled || isUploading}
              className="bg-slate-900 border-0 focus-visible:ring-0 text-xs text-slate-300 placeholder:text-slate-600 h-9"
            />
            {isUploading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-mono text-primary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                UPLOADING...
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-2 px-2 pb-1 sm:pb-0">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-7 text-[10px] font-mono border-slate-800 text-slate-400 hover:text-white"
            >
              <Image className="w-3 h-3 mr-1" /> BROWSE
            </Button>
          </div>
        </div>

        {/* Small drop indicator text */}
        <div className="px-3 pb-1.5 pt-0.5 text-[9px] font-mono text-slate-500 flex items-center gap-1.5">
          <span>{dragActive ? "DROP FILE HERE" : "Drag & drop file to upload to Supabase"}</span>
        </div>
      </div>

      {/* Image Preview */}
      {value && (
        <div className="relative mt-2 w-full max-h-24 rounded-lg bg-slate-900 border border-slate-800/60 overflow-hidden flex items-center justify-center p-2 group">
          <img 
            src={value} 
            alt="Preview" 
            className="max-h-20 max-w-full object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ target: { name, value: '' } })}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Xóa ảnh"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('admin_authenticated') === 'true');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // @ts-ignore
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@toolchoice.vn';

  // Query tools
  const { data: tools = [], isLoading, error, refetch } = useQuery({
    queryKey: ['supabase-tools', 'all'],
    queryFn: () => listTools(1000),
  });

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pricingFilter, setPricingFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedToolForEdit, setSelectedToolForEdit] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedToolForDelete, setSelectedToolForDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({
    name: '',
    tagline: '',
    link: '',
    categories: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Authentication handlers
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      // @ts-ignore
      const secretEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@toolchoice.vn';
      // @ts-ignore
      const secretPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

      if (loginEmail.trim() === secretEmail && loginPassword === secretPassword) {
        localStorage.setItem('admin_authenticated', 'true');
        setIsAdminLoggedIn(true);
        toast({
          title: 'Đăng nhập thành công',
          description: 'Chào mừng trở lại, admin!',
        });
      } else {
        setLoginError('Email hoặc mật khẩu admin không chính xác');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Lỗi hệ thống: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAdminLoggedIn(false);
    toast({
      title: 'Đã đăng xuất',
      description: 'Hệ thống đã khóa truy cập admin.',
      variant: 'default',
    });
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: tools.length,
      featured: tools.filter(t => t.is_trending).length,
      free: tools.filter(t => t.pricing === 'free').length,
      freemium: tools.filter(t => t.pricing === 'freemium').length,
      paid: tools.filter(t => t.pricing === 'paid').length,
    };
  }, [tools]);

  // Filtered tools for display in table
  const filteredTools = useMemo(() => {
    return tools.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'all' || t.categories?.includes(categoryFilter);
      
      let matchPricing = true;
      if (pricingFilter !== 'all') {
        matchPricing = t.pricing === pricingFilter;
      }
      return matchSearch && matchCategory && matchPricing;
    });
  }, [tools, searchQuery, categoryFilter, pricingFilter]);

  // Handle open form in ADD mode
  const handleOpenAdd = () => {
    setSelectedToolForEdit(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({ name: '', tagline: '', link: '', categories: '' });
    setIsFormOpen(true);
  };

  // Handle open form in EDIT mode
  const handleOpenEdit = (tool) => {
    setSelectedToolForEdit(tool);
    setFormData({
      name: tool.name || '',
      tagline: tool.raw_tagline || '',
      description: tool.raw_description || '',
      pricing_type: tool.raw_pricing_type || 'Free',
      link: tool.raw_link || '',
      logo_url: tool.logo_url || '',
      gallery_images: tool.raw_gallery_images || '',
      referral_offer: tool.raw_referral_offer || '',
      pros: tool.raw_pros || '',
      is_featured: tool.raw_is_featured || false,
      is_best_choice: tool.raw_is_best_choice || false,
      status: tool.raw_status || 'approved',
      categories: tool.categories || [],
    });
    setFormErrors({ name: '', tagline: '', link: '', categories: '' });
    setIsFormOpen(true);
  };

  // Toggle category in form state
  const handleCategoryCheckboxChange = (categoryName) => {
    setFormData(prev => {
      const current = prev.categories || [];
      const next = current.includes(categoryName)
        ? current.filter(c => c !== categoryName)
        : [...current, categoryName];
      return { ...prev, categories: next };
    });
  };

  // Handle Form changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Form Validation
  const validateForm = () => {
    const errors = { name: '', tagline: '', link: '', categories: '' };
    if (!formData.name.trim()) errors.name = 'Tên công cụ là bắt buộc';
    if (!formData.link.trim()) errors.link = 'Website URL là bắt buộc';
    else if (!/^https?:\/\/.+/.test(formData.link.trim())) {
      errors.link = 'Đường dẫn phải bắt đầu bằng http:// hoặc https://';
    }
    if (!formData.tagline.trim()) errors.tagline = 'Tagline ngắn là bắt buộc';
    if (formData.categories.length === 0) {
      errors.categories = 'Chọn ít nhất 1 danh mục';
    }
    setFormErrors(errors);
    return !errors.name && !errors.link && !errors.tagline && !errors.categories;
  };

  // Save tool (insert or update)
  const handleSaveTool = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Map form fields to DB columns
      const dbData = {
        name: formData.name.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        pricing_type: formData.pricing_type,
        link: formData.link.trim(),
        logo_url: formData.logo_url.trim() || null,
        gallery_images: formData.gallery_images.trim() || null,
        referral_offer: formData.referral_offer.trim() || null,
        pros: formData.pros.trim() || null,
        is_featured: formData.is_featured,
        is_best_choice: formData.is_best_choice,
        status: formData.status,
        category_text: formData.categories.join(';'),
      };

      if (selectedToolForEdit) {
        // Update operation
        await updateTool(selectedToolForEdit.id, dbData);
        toast({
          title: 'Cập nhật thành công',
          description: `Công cụ "${dbData.name}" đã được cập nhật thành công.`,
          variant: 'success',
        });
      } else {
        // Create operation
        await createTool(dbData);
        toast({
          title: 'Thêm mới thành công',
          description: `Công cụ "${dbData.name}" đã được thêm vào hệ thống.`,
          variant: 'success',
        });
      }

      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['supabase-tools'] });
    } catch (err) {
      toast({
        title: 'Lỗi lưu thông tin',
        description: err.message || 'Đã xảy ra lỗi khi lưu thông tin công cụ.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Delete confirmation
  const handleOpenDelete = (tool) => {
    setSelectedToolForDelete(tool);
    setIsDeleteConfirmOpen(true);
  };

  // Execute delete tool
  const handleDeleteTool = async () => {
    if (!selectedToolForDelete) return;

    setIsDeleting(true);
    try {
      await deleteTool(selectedToolForDelete.id);
      toast({
        title: 'Đã xóa công cụ',
        description: `Công cụ "${selectedToolForDelete.name}" đã bị xóa khỏi hệ thống.`,
        variant: 'success',
      });
      setIsDeleteConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['supabase-tools'] });
    } catch (err) {
      toast({
        title: 'Lỗi xóa công cụ',
        description: err.message || 'Đã xảy ra lỗi khi xóa công cụ.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setSelectedToolForDelete(null);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 relative font-sans antialiased">
        {/* Glow Effects */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-950/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="w-full max-w-md bg-slate-950/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
          
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-bold font-mono text-white tracking-tight">SECURE ACCESS REQUIRED</h2>
            <p className="text-[11px] font-mono text-slate-500 tracking-wider">ADMINISTRATOR CONTROL GATE</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login_email" className="text-xs font-semibold text-slate-400 font-mono">ADMIN IDENTITY</label>
              <Input
                id="login_email"
                type="email"
                placeholder="admin@domain.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-slate-900/60 border-slate-800 h-11 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="login_password" className="text-xs font-semibold text-slate-400 font-mono">PASSCODE</label>
              <Input
                id="login_password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-slate-900/60 border-slate-800 h-11 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200"
                required
              />
            </div>

            <Button type="submit" disabled={isLoggingIn} className="w-full h-11 text-sm font-mono mt-2">
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                "DECRYPT & ACCESS"
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-slate-800/80 pt-6 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center justify-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              RETURN TO MAIN TERMINAL
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans antialiased">
      {/* Glow Effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-950/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-slate-950/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-900 rounded-md">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight font-mono text-white leading-none">TOOLCHOICE // ADMIN</h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">SECURE CONTROL PANEL</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-mono text-slate-300">{adminEmail}</span>
              <span className="text-[9px] text-emerald-500 font-mono tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                ONLINE (SESSION STABLE)
              </span>
            </div>
            <button 
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-rose-950/30 rounded-md transition-all font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Statistics Cards */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-200">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">TOTAL DATABASE</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{stats.total}</span>
              <span className="text-xs text-slate-500">items</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-200">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">FEATURED</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-primary">{stats.featured}</span>
              <span className="text-xs text-slate-500">promoted</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-200">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">MIỄN PHÍ</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">{stats.free}</span>
              <span className="text-xs text-slate-500">free</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-200">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">CÓ FREE TRIAL</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{stats.freemium}</span>
              <span className="text-xs text-slate-500">trial</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-200">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">TRẢ PHÍ</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-rose-400">{stats.paid}</span>
              <span className="text-xs text-slate-500">paid</span>
            </div>
          </div>
        </section>

        {/* Tools Management List */}
        <section className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
          {/* Controls Bar */}
          <div className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  type="text" 
                  placeholder="Tìm kiếm công cụ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-900/60 border-slate-850 h-10 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-900/60 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-primary/50"
                >
                  <option value="all">Tất cả Category</option>
                  {AVAILABLE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Pricing Filter */}
                <select
                  value={pricingFilter}
                  onChange={(e) => setPricingFilter(e.target.value)}
                  className="bg-slate-900/60 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-primary/50"
                >
                  <option value="all">Tất cả Pricing</option>
                  <option value="free">Miễn phí</option>
                  <option value="freemium">Có Free Trial</option>
                  <option value="paid">Trả phí</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => refetch()}
                disabled={isLoading}
                className="w-10 h-10 border border-slate-800 rounded-md flex items-center justify-center hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-colors"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 h-10 bg-primary hover:bg-primary-foreground hover:text-primary hover:border hover:border-primary/40 text-white rounded-md text-sm font-semibold transition-all duration-200 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Thêm Công Cụ
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span>INDEXING DATABASE...</span>
              </div>
            ) : error ? (
              <div className="p-10 text-center space-y-4 max-w-md mx-auto">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h3 className="font-mono text-sm font-bold text-rose-400">DATABASE INTEGRITY ERROR</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{error.message}</p>
                <Button variant="outline" onClick={() => refetch()} className="w-full text-xs font-mono">
                  RETRY CONNECTION
                </Button>
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="p-20 text-center font-mono text-slate-500 text-xs">
                <span>Ø NO RECORDS MATCHING THE FILTERS</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/10 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-5 font-semibold">Công cụ</th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell">Categories</th>
                    <th className="py-3 px-4 font-semibold">Pricing</th>
                    <th className="py-3 px-4 font-semibold">Featured</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredTools.map((tool) => (
                    <tr 
                      key={tool.id}
                      className="hover:bg-slate-900/20 group/row transition-all duration-150"
                    >
                      {/* Logo and Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {tool.logo_url ? (
                              <img
                                src={tool.logo_url}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-xs font-bold font-mono text-primary">{tool.name?.[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-white group-hover/row:text-primary transition-colors block truncate">{tool.name}</span>
                            <span className="text-[11px] text-slate-500 truncate block max-w-xs">{tool.short_description}</span>
                          </div>
                        </div>
                      </td>

                      {/* Categories Badges */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {tool.categories?.map(cat => (
                            <Badge 
                              key={cat} 
                              variant="outline" 
                              className="text-[9px] font-mono bg-slate-950/40 border-slate-800 text-slate-400 font-normal px-1 py-0"
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </td>

                      {/* Pricing Type Badge */}
                      <td className="py-4 px-4">
                        {tool.pricing === 'free' && (
                          <span className="inline-flex items-center text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/50 text-emerald-400">
                            MIỄN PHÍ
                          </span>
                        )}
                        {tool.pricing === 'freemium' && (
                          <span className="inline-flex items-center text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-950/20 border border-amber-900/50 text-amber-400">
                            FREE TRIAL
                          </span>
                        )}
                        {tool.pricing === 'paid' && (
                          <span className="inline-flex items-center text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-950/20 border border-rose-900/50 text-rose-400">
                            TRẢ PHÍ
                          </span>
                        )}
                      </td>

                      {/* Featured Flags */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <div className="flex flex-col gap-0.5">
                          {tool.raw_is_featured && (
                            <span className="text-[10px] text-primary flex items-center gap-1 font-semibold">
                              <Sparkles className="w-3 h-3 flex-shrink-0" /> Featured
                            </span>
                          )}
                          {tool.raw_is_best_choice && (
                            <span className="text-[10px] text-amber-500 flex items-center gap-1 font-semibold">
                              <CheckCircle className="w-3 h-3 flex-shrink-0" /> Best Choice
                            </span>
                          )}
                          {!tool.raw_is_featured && !tool.raw_is_best_choice && (
                            <span className="text-slate-600 text-[10px]">None</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {tool.raw_status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/15 border border-emerald-900/20 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/15 border border-amber-900/20 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 status-pulse" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(tool)}
                            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(tool)}
                            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-950/30 transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer stats metadata */}
          <div className="border-t border-slate-800/80 px-5 py-3 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>SHOWING {filteredTools.length} OF {tools.length} REGISTERED TOOL(S)</span>
            <span className="hidden sm:inline">REST CLIENT STATE READY // ORDER_BY created_at.desc</span>
          </div>
        </section>

      </main>

      {/* FORM DRAWER (Add / Edit Tool) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => !isSaving && setIsFormOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-2xl h-full bg-[#090d16] border-l border-slate-800 shadow-2xl flex flex-col z-10 transition-transform duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-850 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
                  <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    {selectedToolForEdit ? 'EDIT_RECORD' : 'CREATE_RECORD'}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 tracking-wider">
                    {selectedToolForEdit ? `ID: ${String(selectedToolForEdit.id).slice(0, 8)}...` : 'SUPABASE TABLE INSERT'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
                className="w-8 h-8 rounded border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields - Scrollable */}
            <form onSubmit={handleSaveTool} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Tool Identity Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-mono font-bold text-primary tracking-wider border-b border-slate-800/80 pb-1 uppercase">1. Thông tin cơ bản</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-semibold text-slate-300">Tên Công Cụ <span className="text-rose-500">*</span></label>
                    <Input 
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Midjourney"
                      disabled={isSaving}
                      className={`bg-slate-900/60 border-slate-800 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200 ${formErrors.name ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                    />
                    {formErrors.name && <p className="text-[10px] text-rose-500 font-mono mt-1">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="link" className="text-xs font-semibold text-slate-300">Website URL <span className="text-rose-500">*</span></label>
                    <Input 
                      id="link"
                      name="link"
                      type="text"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      disabled={isSaving}
                      className={`bg-slate-900/60 border-slate-800 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200 ${formErrors.link ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                    />
                    {formErrors.link && <p className="text-[10px] text-rose-500 font-mono mt-1">{formErrors.link}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="tagline" className="text-xs font-semibold text-slate-300">Tagline (Mô tả ngắn gọn) <span className="text-rose-500">*</span></label>
                  <Input 
                    id="tagline"
                    name="tagline"
                    type="text"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    placeholder="Mô tả công cụ trong 1 câu ngắn..."
                    disabled={isSaving}
                    className={`bg-slate-900/60 border-slate-800 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200 ${formErrors.tagline ? 'border-rose-500' : ''}`}
                  />
                  {formErrors.tagline && <p className="text-[10px] text-rose-500 font-mono mt-1">{formErrors.tagline}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-xs font-semibold text-slate-300">Mô tả đầy đủ</label>
                  <Textarea 
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết tính năng, cách thức hoạt động..."
                    disabled={isSaving}
                    rows={4}
                    className="bg-slate-900/60 border-slate-800 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200 resize-y min-h-[100px]"
                  />
                </div>
              </div>

              {/* Categorization & Pricing Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-mono font-bold text-primary tracking-wider border-b border-slate-800/80 pb-1 uppercase">2. Phân loại & Pricing</h4>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Danh mục (Chọn nhiều danh mục phù hợp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-900/30 border border-slate-850/60 rounded-lg p-3">
                    {AVAILABLE_CATEGORIES.map(category => (
                      <label 
                        key={category}
                        className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-slate-900 cursor-pointer text-xs select-none"
                      >
                        <input 
                          type="checkbox"
                          checked={formData.categories?.includes(category)}
                          onChange={() => handleCategoryCheckboxChange(category)}
                          disabled={isSaving}
                          className="w-3.5 h-3.5 accent-primary rounded bg-slate-950 border-slate-800"
                        />
                        <span className="text-slate-300">{category}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.categories && <p className="text-[10px] text-rose-500 font-mono mt-1">{formErrors.categories}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label htmlFor="pricing_type" className="text-xs font-semibold text-slate-300">Hình thức thanh toán</label>
                    <select
                      id="pricing_type"
                      name="pricing_type"
                      value={formData.pricing_type}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-md h-10 px-3 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
                    >
                      <option value="Free">Miễn Phí (Free)</option>
                      <option value="Freemium">Có Free Trial / Freemium</option>
                      <option value="Paid">Trả Phí (Paid)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="status" className="text-xs font-semibold text-slate-300">Trạng thái xuất bản</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-md h-10 px-3 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
                    >
                      <option value="approved">Approved (Hiển thị ngay)</option>
                      <option value="pending">Pending (Chờ duyệt)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Media & Features Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-mono font-bold text-primary tracking-wider border-b border-slate-800/80 pb-1 uppercase">3. Media & Tính năng</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploadInput 
                    label="Logo Image URL"
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                    disabled={isSaving}
                  />

                  <ImageUploadInput 
                    label="Gallery / Feature Image URL"
                    id="gallery_images"
                    name="gallery_images"
                    value={formData.gallery_images}
                    onChange={handleInputChange}
                    placeholder="https://example.com/cover.png"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="referral_offer" className="text-xs font-semibold text-slate-300">Ưu đãi giới thiệu (Badge vàng nổi bật - để trống nếu không có)</label>
                  <Input
                    id="referral_offer"
                    name="referral_offer"
                    value={formData.referral_offer}
                    onChange={handleInputChange}
                    placeholder="VD: Bấm vào link để nhận ngay 100 credit"
                    disabled={isSaving}
                    className="bg-slate-900/60 border-slate-800 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="pros" className="text-xs font-semibold text-slate-300">Tính năng nổi bật (Pros - Mỗi tính năng một dòng)</label>
                  <Textarea 
                    id="pros"
                    name="pros"
                    value={formData.pros}
                    onChange={handleInputChange}
                    placeholder="Mỗi tính năng là một dòng mới&#10;Giao diện thân thiện&#10;Tạo ảnh nhanh trong 10 giây&#10;Hỗ trợ xuất file độ phân giải cao"
                    disabled={isSaving}
                    rows={3}
                    className="bg-slate-900/60 border-slate-800 text-sm focus-visible:ring-primary focus-visible:border-primary text-slate-200 resize-y"
                  />
                </div>
              </div>

              {/* Flags (Featured & Best Choice) */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[11px] font-mono font-bold text-primary tracking-wider border-b border-slate-800/80 pb-1 uppercase">4. Tùy chọn hiển thị</h4>
                
                <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/20 border border-slate-850/60 rounded-lg p-4">
                  <label className="flex-1 flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      className="mt-1 w-4 h-4 accent-primary rounded bg-slate-950 border-slate-800"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-200 block">Featured Tool</span>
                      <span className="text-[10px] text-slate-500 block leading-relaxed">Đánh dấu công cụ nổi bật để ghim hoặc làm nổi bật trên giao diện trang chủ.</span>
                    </div>
                  </label>

                  <div className="w-px bg-slate-800/50 hidden sm:block" />

                  <label className="flex-1 flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      name="is_best_choice"
                      checked={formData.is_best_choice}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      className="mt-1 w-4 h-4 accent-amber-500 rounded bg-slate-950 border-slate-800"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-200 block text-amber-500">Best Choice</span>
                      <span className="text-[10px] text-slate-500 block leading-relaxed">Dán nhãn "Lựa chọn tốt nhất" cho công cụ này (tăng mức độ uy tín).</span>
                    </div>
                  </label>
                </div>
              </div>

            </form>

            {/* Footer with Actions */}
            <div className="p-5 border-t border-slate-850 bg-slate-950/80 flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
                className="text-xs font-mono border-slate-800 text-slate-400 hover:text-white"
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleSaveTool}
                disabled={isSaving}
                className="text-xs font-mono font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    SAVING...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    SAVE_RECORD
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => !isDeleting && setIsDeleteConfirmOpen(false)}
          />

          {/* Modal box */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 overflow-hidden z-10">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-950/20 border border-rose-900/40 flex items-center justify-center text-rose-500 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-sm font-bold font-mono text-rose-400 uppercase tracking-tight">Xóa công cụ?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hành động này <span className="font-bold text-slate-200">không thể phục hồi</span>. Công cụ <span className="font-semibold text-white break-words">"{selectedToolForDelete?.name}"</span> sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="text-xs font-mono border-slate-800 text-slate-400 hover:text-white"
              >
                HUỶ BỎ
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteTool}
                disabled={isDeleting}
                className="text-xs font-mono font-semibold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    DELETING...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    DELETE_RECORD
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
