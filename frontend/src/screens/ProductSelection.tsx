import React from 'react';
import { useApp } from '../context/AppContext';
import type { Product } from '../context/AppContext';
import { ChevronRight, Layers, Users } from 'lucide-react';

export const ProductSelection: React.FC = () => {
  const { products, setSelectedProductId, setSelectedSerial, setCurrentScreen } = useApp();

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    // Select the first serial number of the selected product by default
    if (product.services && product.services.length > 0) {
      setSelectedSerial(product.services[0].serialNumber);
    }
    setCurrentScreen('dashboard');
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Info */}
      <div 
        className="flex-between" 
        style={{ 
          borderBottom: '1px solid var(--color-outline-variant)', 
          paddingBottom: '16px',
          marginBottom: '12px'
        }}
      >
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-bright">
            Product Catalog
          </h2>
        </div>
      </div>

      {/* List of Product Row Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {products.map(product => {
          return (
            <div 
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className="product-row-card"
            >
              {/* Left Column: Product Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 2, minWidth: '240px' }}>
                <span className="text-nano font-mono font-black uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                  MAPPING CODE: {product.id.toUpperCase()}
                </span>
                
                {/* Big Prominent Product Name */}
                <h3 className="text-2xl font-black text-bright" style={{ margin: 0 }}>
                  {product.name}
                </h3>
                
                {/* Metadata counts */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)' }}>
                    <Layers style={{ width: 14, height: 14, color: 'var(--color-primary)' }} />
                    <span className="text-xs font-mono font-bold">{product.modulesCount} Modules</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)' }}>
                    <Users style={{ width: 14, height: 14, color: 'var(--color-primary)' }} />
                    <span className="text-xs font-mono font-bold">{product.services.length} Serials</span>
                  </div>
                </div>
              </div>

              {/* Center Column: Completion Progress */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 3, maxWidth: '420px', width: '100%' }}>
                <div className="flex-between text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
                  <span>Production Completion</span>
                  <span className="font-mono text-base font-black text-bright">{product.progress}%</span>
                </div>
                <div 
                  style={{ 
                    height: '8px', 
                    backgroundColor: 'var(--color-surface-container-low)', 
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-outline-variant)'
                  }}
                >
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: 'var(--color-primary)', 
                      width: `${product.progress}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Right Column: Enter Action CTA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1, minWidth: '180px' }}>
                <button 
                  className="btn btn-ghost"
                  style={{
                    height: '42px',
                    padding: '0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 900,
                    fontSize: '11px',
                    borderColor: 'var(--color-outline-variant)',
                    backgroundColor: 'var(--color-surface-container-lowest)'
                  }}
                >
                  <span>ENTER SYSTEM</span>
                  <ChevronRight style={{ width: 14, height: 14, color: 'var(--color-primary)' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
