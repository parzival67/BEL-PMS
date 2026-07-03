import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Plus, LayoutGrid, Cog, Key, ShieldAlert } from 'lucide-react';

export const AdminMaster: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    addProduct,
    addServiceToProduct,
    addModuleToProduct,
    currentRole
  } = useApp();

  const [newProductName, setNewProductName] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newModuleName, setNewModuleName] = useState('');

  // Find active product detail
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeSerials = activeProduct?.services.map(s => s.serialNumber) || [];
  
  // Find modules list
  const activeModules = activeProduct?.services[0]?.modules || [];

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    addProduct(newProductName.trim());
    setNewProductName('');
  };

  const handleAddSerialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial.trim() || !selectedProductId) return;
    addServiceToProduct(selectedProductId, newSerial.trim());
    setNewSerial('');
  };

  const handleAddModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || !selectedProductId) return;
    addModuleToProduct(selectedProductId, newModuleName.trim());
    setNewModuleName('');
  };

  const isAdminRole = currentRole === 'Admin';

  return (
    <div className="page-container">
      {/* Header Info */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings style={{ width: 28, height: 28, color: 'var(--color-primary)' }} />
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider">System Master Configuration</h2>
            <span className="text-xs">Define products, map modules, configure stages, and assign ATE flags</span>
          </div>
        </div>

        {!isAdminRole && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 12px', 
              backgroundColor: 'rgba(239,68,68,0.1)', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239,68,68,0.2)'
            }}
          >
            <ShieldAlert style={{ width: 16, height: 16, color: 'var(--color-status-critical-txt)' }} />
            <span className="text-xs font-bold text-bright" style={{ color: 'var(--color-status-critical-txt)' }}>
              VIEW ONLY (Switch role to [Admin] to edit configurations)
            </span>
          </div>
        )}
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        
        {/* Card 1: Products */}
        <div className="pms-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
            <span className="text-xs font-black uppercase tracking-wider text-bright">Products configuration</span>
          </div>

          {/* List of existing products */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {products.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: selectedProductId === p.id ? 'var(--color-surface-container)' : 'var(--color-surface-container-low)',
                  border: selectedProductId === p.id ? '1px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span className="text-xs font-bold text-bright">{p.name}</span>
                <span className="text-nano font-mono" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {p.id.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Form to add product */}
          <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-nano uppercase font-black">Add New Product</label>
              <input
                type="text"
                placeholder="Product Name (e.g. ALNS)"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                disabled={!isAdminRole}
                className="input-field text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={!isAdminRole || !newProductName.trim()}
              className="btn btn-primary"
              style={{ padding: '8px', fontSize: '10px', height: '32px' }}
            >
              <Plus style={{ width: 12, height: 12 }} />
              ADD PRODUCT
            </button>
          </form>
        </div>

        {/* Card 2: Services / Serials */}
        <div className="pms-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
            <span className="text-xs font-black uppercase tracking-wider text-bright">Service Serial Registry</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="text-nano font-mono uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
              CONFIGURING FOR: {activeProduct?.name}
            </span>
          </div>

          {/* List of serials */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {activeSerials.length === 0 ? (
              <span className="text-xs">No registered serial numbers</span>
            ) : (
              activeSerials.map(serial => (
                <div
                  key={serial}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface-container-low)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-surface-bright)',
                    display: 'inline-block'
                  }}
                >
                  {serial}
                </div>
              ))
            )}
          </div>

          {/* Form to add serial */}
          <form onSubmit={handleAddSerialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-nano uppercase font-black">Register New Serial</label>
              <input
                type="text"
                placeholder="Serial Number (e.g. SN004)"
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                disabled={!isAdminRole}
                className="input-field text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!isAdminRole || !newSerial.trim()}
              className="btn btn-primary"
              style={{ padding: '8px', fontSize: '10px', height: '32px' }}
            >
              <Plus style={{ width: 12, height: 12 }} />
              REGISTER SERIAL
            </button>
          </form>
        </div>

        {/* Card 3: Modules Map */}
        <div className="pms-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cog style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
            <span className="text-xs font-black uppercase tracking-wider text-bright">Modules Mapping</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="text-nano font-mono uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
              CONFIGURING FOR: {activeProduct?.name}
            </span>
          </div>

          {/* List of modules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {activeModules.length === 0 ? (
              <span className="text-xs">No modules mapped</span>
            ) : (
              activeModules.map(mod => (
                <div
                  key={mod.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface-container-low)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--color-surface-bright)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{mod.name}</span>
                  <span className="text-nano font-mono" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {mod.id.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Form to add module */}
          <form onSubmit={handleAddModuleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-nano uppercase font-black">Map New Module</label>
              <input
                type="text"
                placeholder="Module Name (e.g. Servo Drive)"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                disabled={!isAdminRole}
                className="input-field text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={!isAdminRole || !newModuleName.trim()}
              className="btn btn-primary"
              style={{ padding: '8px', fontSize: '10px', height: '32px' }}
            >
              <Plus style={{ width: 12, height: 12 }} />
              MAP MODULE
            </button>
          </form>
        </div>

      </div>

      {/* Workflow Builder Configuration section */}
      <div className="pms-card">
        <span className="text-xs font-black uppercase tracking-wider text-bright">
          Stages & Sub-stages Work-flow Map
        </span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="text-xs">
            The system maps products to four core stages, each hosting sub-stages defined inside. Marked <strong>ATE</strong> sub-stages trigger automatic OCR validation processing of uploaded documents:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '8px' }}>
            
            {/* Stage: IGQA */}
            <div style={{ backgroundColor: 'var(--color-surface-container-low)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-outline-variant)' }}>
              <span className="text-xs font-bold text-bright uppercase tracking-wider">1. IGQA</span>
              <ul style={{ listStyle: 'none', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="text-nano font-mono">• BARE PCB INSPECTION</li>
                <li className="text-nano font-mono">• HOUSING & MECHANICAL</li>
                <li className="text-nano font-mono">• ELECTRICAL COMPONENTS</li>
              </ul>
            </div>

            {/* Stage: Assembly */}
            <div style={{ backgroundColor: 'var(--color-surface-container-low)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-outline-variant)' }}>
              <span className="text-xs font-bold text-bright uppercase tracking-wider">2. Assembly</span>
              <ul style={{ listStyle: 'none', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="text-nano font-mono">• PCB SOLDER ASSEMBLY</li>
                <li className="text-nano font-mono">• WIRING & HARNESSING</li>
                <li className="text-nano font-mono">• FINAL MECHANICAL ASSY</li>
              </ul>
            </div>

            {/* Stage: Testing */}
            <div style={{ backgroundColor: 'var(--color-surface-container-low)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-outline-variant)' }}>
              <div className="flex-between">
                <span className="text-xs font-bold text-bright uppercase tracking-wider">3. Testing</span>
                <span className="text-nano font-mono font-bold" style={{ color: 'var(--color-primary)' }}>HOSTS ATE</span>
              </div>
              <ul style={{ listStyle: 'none', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="text-nano font-mono flex-between">
                  <span>• DSP ATE TESTING</span>
                  <span style={{ fontSize: '8px', padding: '2px 4px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--color-primary)', borderRadius: '2px' }}>Is ATE</span>
                </li>
                <li className="text-nano font-mono">• ENVIRONMENTAL CHAMBER</li>
                <li className="text-nano font-mono">• FULL SYSTEM CALIBRATE</li>
              </ul>
            </div>

            {/* Stage: Final QA */}
            <div style={{ backgroundColor: 'var(--color-surface-container-low)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-outline-variant)' }}>
              <span className="text-xs font-bold text-bright uppercase tracking-wider">4. Final QA</span>
              <ul style={{ listStyle: 'none', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="text-nano font-mono">• DOCUMENTATION AUDIT</li>
                <li className="text-nano font-mono">• RELEASE SIGN-OFF</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
