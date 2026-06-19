'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: AlertType;
  isConfirm: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (title: string, message: string, type?: AlertType) => void;
  showConfirm: (title: string, message: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    isConfirm: false,
  });

  const showAlert = useCallback((title: string, message: string, type: AlertType = 'info') => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      isConfirm: false,
    });
  }, []);

  const showConfirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        title,
        message,
        type: 'warning',
        isConfirm: true,
        onConfirm: () => {
          setAlertState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setAlertState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const closeAlert = () => {
    if (alertState.isConfirm && alertState.onCancel) {
      alertState.onCancel();
    } else {
      setAlertState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const getTypeStyles = (type: AlertType) => {
    switch (type) {
      case 'success':
        return {
          icon: 'check_circle',
          color: 'text-green-500',
          bg: 'bg-green-50',
          btn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        };
      case 'error':
        return {
          icon: 'error',
          color: 'text-red-500',
          bg: 'bg-red-50',
          btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          icon: 'warning',
          color: 'text-orange-500',
          bg: 'bg-orange-50',
          btn: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
        };
      default:
        return {
          icon: 'info',
          color: 'text-[#006655]',
          bg: 'bg-[#006655]/10',
          btn: 'bg-[#006655] hover:bg-[#004d40] focus:ring-[#006655]',
        };
    }
  };

  const styles = getTypeStyles(alertState.type);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {alertState.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeAlert}
          ></div>
          
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200"
            role="dialog" 
            aria-modal="true"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full ${styles.bg} flex items-center justify-center mb-4`}>
                <span className={`material-icons text-3xl ${styles.color}`}>{styles.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-[#19322F] mb-2">
                {alertState.title}
              </h3>
              
              <p className="text-gray-500 mb-6 whitespace-pre-wrap">
                {alertState.message}
              </p>
              
              <div className="flex gap-3 w-full justify-center">
                {alertState.isConfirm ? (
                  <>
                    <button
                      onClick={alertState.onCancel}
                      className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={alertState.onConfirm}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.btn}`}
                    >
                      Confirmar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeAlert}
                    className={`w-full max-w-[200px] px-4 py-2.5 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.btn}`}
                  >
                    Aceptar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}
