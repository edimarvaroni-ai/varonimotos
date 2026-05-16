import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bike, Camera, MapPin, CheckCircle2, 
  ArrowRight, Shield, Zap, Info, Plus, 
  Trash2, Image as ImageIcon, Loader2,
  ClipboardCheck
} from "lucide-react";
import { 
  db, auth, storage, collection, addDoc, serverTimestamp,
  ref, uploadBytes, getDownloadURL, uploadBytesResumable, handleFirestoreError, OperationType,
  query, orderBy, onSnapshot
} from "../lib/firebase";

interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export function SellPage({ user }: { user: any }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: 2024,
    price: "",
    condition: "Seminova",
    kilometers: "",
    description: "",
    category: "Street",
    specs: "Motor Potente • Econômica",
    images: [] as string[],
    color: "",
    location: {
      lat: -23.55052,
      lng: -46.633308,
      city: "São Paulo",
      state: "SP"
    }
  });

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const TARGET_WIDTH = 960;
          const TARGET_HEIGHT = 1280;
          
          canvas.width = TARGET_WIDTH;
          canvas.height = TARGET_HEIGHT;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Falha ao obter contexto 2D'));
            return;
          }

          // Calculate cover fit dimensions
          const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;
          const imgRatio = img.width / img.height;
          let drawWidth = TARGET_WIDTH;
          let drawHeight = TARGET_HEIGHT;
          let offsetX = 0;
          let offsetY = 0;

          if (imgRatio > targetRatio) {
            drawWidth = img.height * targetRatio;
            drawHeight = img.height;
            offsetX = (img.width - drawWidth) / 2;
          } else {
            drawWidth = img.width;
            drawHeight = img.width / targetRatio;
            offsetY = (img.height - drawHeight) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
          
          canvas.toBlob((blob) => {
            if (blob) {
              console.log(`[Resize] Finalizado: ${img.width}x${img.height} -> ${TARGET_WIDTH}x${TARGET_HEIGHT} (${Math.round(blob.size/1024)}KB)`);
              resolve(blob);
            }
            else reject(new Error('Falha ao converter para Blob'));
          }, 'image/jpeg', 0.85);
        };
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File[]) => {
    const files = Array.isArray(e) ? e : Array.from(e.target.files || []);
    if (!files.length || !user) return;

    setIsUploading(true);
    
    // Create new workers first
    const newWorkers: UploadProgress[] = files.map(file => {
      const id = Math.random().toString(36).substring(7);
      let name = file.name;
      // If it's a pasted image or missing name, give it a placeholder
      if (!name || name === "image" || name === "blob") {
        const timestamp = new Date().toLocaleTimeString();
        name = `Imagem_${timestamp.replace(/:/g, '-')}_${id.substring(0, 4)}`;
      }
      return {
        id,
        name,
        progress: 0,
        status: 'uploading'
      };
    });

    setUploadQueue(prev => [...prev, ...newWorkers]);
    
    const uploadPromises = files.map(async (file, index) => {
      const worker = newWorkers[index];
      const uploadId = worker.id;
      const fileName = worker.name.replace(/[^a-z0-9.]/gi, '_') + '.jpg';
      const storagePath = `listings/${user.uid}/${Date.now()}-${uploadId}-${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      console.log(`[Storage] Redimensionando e enviando: ${worker.name}`);

      try {
        setUploadQueue(prev => prev.map(w => w.id === uploadId ? { ...w, status: 'uploading', error: undefined } : w));

        // Resize first
        const resizedBlob = await resizeImage(file);
        
        const metadata = {
          contentType: 'image/jpeg'
        };

        return new Promise<string>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, resizedBlob, metadata);

          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`[Storage] Upload ${worker.name}: ${Math.round(progress)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes})`);
              setUploadQueue(prev => prev.map(w => 
                w.id === uploadId ? { ...w, progress } : w
              ));
            }, 
            (error) => {
              console.error("[Storage] Erro no upload:", worker.name, error);
              let errorMsg = error.code;
              if (error.code === 'storage/unauthorized') errorMsg = 'Permissão negada';
              if (error.code === 'storage/quota-exceeded') errorMsg = 'Quota excedida';
              
              setUploadQueue(prev => prev.map(w => 
                w.id === uploadId ? { ...w, status: 'error', error: errorMsg } : w
              ));
              reject(error);
            }, 
            async () => {
              try {
                console.log(`[Storage] Finalizado: ${worker.name}. Buscando URL...`);
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setUploadQueue(prev => prev.map(w => 
                  w.id === uploadId ? { ...w, status: 'completed', url: downloadURL, progress: 100 } : w
                ));
                setFormData(prev => ({
                  ...prev,
                  images: [...prev.images, downloadURL]
                }));
                resolve(downloadURL);
              } catch (err: any) {
                console.error("[Storage] Erro ao obter URL:", err);
                setUploadQueue(prev => prev.map(w => 
                  w.id === uploadId ? { ...w, status: 'error', error: 'Erro URL' } : w
                ));
                reject(err);
              }
            }
          );
        });
      } catch (err: any) {
        console.error("[Storage] Falha no processamento:", err);
        setUploadQueue(prev => prev.map(w => 
          w.id === uploadId ? { ...w, status: 'error', error: 'Erro Processamento' } : w
        ));
        return Promise.reject(err);
      }
    });

    try {
      await Promise.all(uploadPromises);
    } catch (err) {
      console.error("[Storage] Falha em um ou mais envios", err);
    } finally {
      setIsUploading(false);
      if (e && !Array.isArray(e) && e.target) {
        e.target.value = '';
      }
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        handleFileUpload(files);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [user?.uid]);

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleUrlAdd = () => {
    if (!imageUrl) return;
    try {
      new URL(imageUrl);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      setImageUrl("");
    } catch (e) {
      alert("Por favor, insira uma URL de imagem válida.");
    }
  };

  const [catalogItems, setCatalogItems] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "catalog"), orderBy("model", "asc"));
    return onSnapshot(q, (snap) => {
      setCatalogItems(snap.docs.map(d => d.data()));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "catalog");
    });
  }, []);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitError(null);
    const path = "listings";
    try {
      await addDoc(collection(db, path), {
        ...formData,
        userId: user.uid,
        price: Number(formData.price),
        kilometers: Number(formData.kilometers),
        status: "active",
        isPremium: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate("/dashboard");
    } catch (error) {
      setSubmitError("Erro ao criar anúncio. Verifique sua conexão e tente novamente.");
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-8 glass-card premium-border p-12 rounded-[3.5rem]">
          <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mx-auto border border-yellow-400/20">
            <Shield className="w-10 h-10 text-yellow-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Acesso Restrito</h2>
            <p className="text-xs text-white/30 uppercase font-bold tracking-widest leading-relaxed">
              Você precisa estar logado para anunciar sua moto no marketplace Varoni.
            </p>
          </div>
          <button onClick={() => navigate("/")} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border-0 cursor-pointer">Ir para Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-400/30">
              <Camera className="w-8 h-8 text-black" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-1">Anunciar agora</p>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter">Venda sua <span className="text-white/20">Máquina</span></h1>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:block text-right glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.02]"
            >
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Status de Conexão</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400">{user.email}</p>
              <p className="text-[8px] text-white/10 mt-1 uppercase font-black">ID: {user.uid.substring(0, 8)}...</p>
            </motion.div>
          </div>

          <div className="relative h-[240px] rounded-[3.5rem] overflow-hidden group premium-border">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <img 
              src="https://i.ibb.co/rGcMvDYT/image.jpg" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
              alt="Reference Machine"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200";
              }}
            />
            <div className="absolute bottom-8 left-10 z-20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-400">Qualidade Varoni</p>
              </div>
              <p className="text-2xl font-black uppercase italic tracking-tighter text-white">Anúncios com boas fotos vendem <span className="text-yellow-400">3x mais rápido</span></p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Step 1: Basic Info */}
          <section className="glass-card premium-border p-12 rounded-[3rem] space-y-10">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Info Básica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Marca</label>
                <input 
                  required
                  list="brand-suggestions"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic uppercase outline-none focus:border-yellow-400/50 transition-all placeholder:text-white/5"
                  placeholder="Ex: Honda"
                />
                <datalist id="brand-suggestions">
                  {["Honda", "Yamaha", "BMW", "Kawasaki", "Ducati", "Triumph", "Harley-Davidson", "Suzuki", "Royal Enfield", "KTM"].map(b => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Modelo</label>
                <input 
                  required
                  list="model-suggestions"
                  value={formData.model}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({...formData, model: val});
                    // Auto-fill brand or category if model matches a catalog item
                    const match = catalogItems.find(item => item.model === val);
                    if (match) {
                      setFormData(prev => ({
                        ...prev,
                        model: val,
                        brand: match.brand || prev.brand,
                        category: match.type || prev.category
                      }));
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic placeholder:text-white/5 outline-none focus:border-yellow-400/50 transition-all"
                  placeholder="Ex: CB 500F"
                />
                <datalist id="model-suggestions">
                  {catalogItems.map((item, i) => (
                    <option key={i} value={item.model}>{item.type}</option>
                  ))}
                  {!catalogItems.length && ["CB 500F", "R1250 GS", "MT-07", "Ninja 400", "Iron 883", "Tiger 900"].map(m => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Ano</label>
                <input 
                  required
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic outline-none focus:border-red-600/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Cor</label>
                <input 
                  required
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic optional:uppercase outline-none focus:border-yellow-400/50 transition-all placeholder:text-white/5"
                  placeholder="Ex: Preto"
                />
              </div>
              <div className="space-y-6 md:col-span-2 mt-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Condição da Moto</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "Nova", label: "0KM / NOVA", desc: "Zerar o odômetro" },
                    { id: "Seminova", label: "SEMI-NOVA", desc: "Excelente estado" },
                    { id: "Usada", label: "USADA", desc: "Com quilometragem" }
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setFormData({...formData, condition: cond.id})}
                      className={`p-6 rounded-[2rem] border transition-all text-left group relative overflow-hidden bg-transparent cursor-pointer ${
                        formData.condition === cond.id 
                          ? 'border-yellow-400 bg-yellow-400/5' 
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            formData.condition === cond.id ? 'text-yellow-400' : 'text-white/40'
                          }`}>
                            {cond.label}
                          </p>
                          {formData.condition === cond.id && <CheckCircle2 className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${
                          formData.condition === cond.id ? 'text-white' : 'text-white/20'
                        }`}>
                          {cond.desc}
                        </p>
                      </div>
                      {formData.condition === cond.id && (
                        <motion.div 
                          layoutId="condition-bg"
                          className="absolute inset-0 bg-yellow-400/5 pointer-events-none"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Estilo</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic outline-none focus:border-yellow-400/50 transition-all appearance-none cursor-pointer"
                >
                  {["Street", "Naked", "Esportiva", "Custom", "Trail", "Adventure"].map(c => (
                    <option key={c} value={c} className="bg-neutral-900">{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Step 2: Specs and Price */}
          <section className="glass-card premium-border p-12 rounded-[3rem] space-y-10">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Detalhes e Preço</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Preço (R$)</label>
                <input 
                  required
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-2xl font-black italic outline-none focus:border-yellow-400/50 transition-all text-yellow-400"
                  placeholder="30000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">KM Rodados</label>
                <input 
                  required
                  type="number"
                  value={formData.kilometers}
                  onChange={e => setFormData({...formData, kilometers: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-bold italic outline-none focus:border-red-600/50 transition-all"
                  placeholder="5000"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Descrição Detalhada</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-sm font-medium outline-none focus:border-yellow-400/50 transition-all resize-none placeholder:text-white/5 leading-relaxed"
                  placeholder="Descreva o estado de conservação, manutenções e diferenciais..."
                />
              </div>
            </div>
          </section>

          {/* Step 3: Images */}
          <section className="glass-card premium-border p-12 rounded-[3rem] space-y-10">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Fotos da Máquina</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-400/5 premium-border rounded-[2rem] p-6 flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Dica para WhatsApp</p>
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 leading-relaxed">
                    Você pode <span className="text-yellow-400">colar (Ctrl + V)</span> imagens copiadas do WhatsApp Web diretamente aqui no site.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Upload do Computador</label>
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-yellow-400');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-yellow-400');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-yellow-400');
                      const files = Array.from(e.dataTransfer.files);
                      handleFileUpload(files);
                    }}
                    className="flex flex-col items-center justify-center w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/10 hover:border-yellow-400/50 transition-all group overflow-hidden relative"
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6 text-yellow-400" />
                         </div>
                         <div className="text-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-white">Arraste ou Clique</p>
                           <p className="text-[8px] font-medium uppercase tracking-widest text-white/20 mt-1">Selecione múltiplas fotos</p>
                         </div>
                       </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Adicionar por Link URL</label>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[180px] flex flex-col justify-center space-y-4">
                    <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                      Cole o link direto da imagem hospedada na internet.
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlAdd())}
                        className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl text-[10px] font-medium outline-none focus:border-yellow-400/50 transition-all text-white placeholder:text-white/5"
                        placeholder="https://exemplo.com/moto.jpg"
                      />
                      <button 
                        type="button"
                        onClick={handleUrlAdd}
                        className="px-4 bg-yellow-400 text-black rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white transition-all cursor-pointer border-0"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
                      <Zap className="w-3 h-3" />
                      <span>Processamento instantâneo</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Fila de Upload ({uploadQueue.filter(w => w.status === 'uploading').length})</label>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-4 h-[180px] overflow-y-auto no-scrollbar space-y-3">
                    {uploadQueue.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <Loader2 className="w-6 h-6 mb-2" />
                        <p className="text-[8px] font-black uppercase tracking-widest">Aguardando arquivos</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {uploadQueue.map((worker) => (
                          <div key={worker.id} className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[9px] font-black uppercase tracking-widest truncate max-w-[150px] text-white/60">{worker.name}</p>
                              <div className="flex items-center gap-2">
                                {worker.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                {worker.status === 'error' && <Shield className="w-3 h-3 text-red-500" />}
                                <span className={`text-[8px] font-black ${worker.status === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                                  {worker.status === 'error' ? (worker.error || 'Erro') : `${Math.round(worker.progress)}%`}
                                </span>
                              </div>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${worker.progress}%` }}
                                className={`h-full ${worker.status === 'error' ? 'bg-red-500' : 'bg-yellow-400'}`}
                              />
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={() => setUploadQueue([])}
                          className="w-full py-2 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                        >
                          Limpar Fila
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-0"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div className="col-span-full py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4">
                    <ImageIcon className="w-10 h-10 text-white/10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center px-8">
                      Nenhuma foto adicionada.<br />Faça upload do computador ou cole imagens diretamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Submission */}
          <div className="flex flex-col gap-6 p-12 glass-card premium-border rounded-[3rem] bg-yellow-400/5">
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-sm font-bold uppercase tracking-widest italic"
              >
                <Shield className="w-5 h-5 shrink-0" />
                {submitError}
              </motion.div>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">Pronto para anunciar?</p>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Sua moto será listada imediatamente após a confirmação.</p>
              </div>
              <button 
                type="submit"
                className="px-12 py-6 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-4 hover:bg-white transition-all shadow-4xl shadow-yellow-400/40 border-0 cursor-pointer"
              >
                Publicar Máquina
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
