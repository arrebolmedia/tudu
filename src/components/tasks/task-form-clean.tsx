'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Flag, ArrowUp, Circle, Play, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { Task, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/types';
import { formatDate } from '@/lib/utils';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Task;
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setPriority(initialData.priority);
        setStatus(initialData.status);
        setDueDate(initialData.dueDate || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('pending');
        setDueDate('');
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      
      const target = event.target as HTMLElement;
      
      if (target.closest('.react-calendar')) {
        return;
      }
      
      if (modalRef.current && !modalRef.current.contains(target)) {
        setShowCalendar(false);
        setShowPriorityDropdown(false);
        setShowStatusDropdown(false);
      }
      
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(target)) {
        setShowPriorityDropdown(false);
      }
      
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || undefined,
      });
      onClose();
    }
  };

  const handleDateSelect = (date: string) => {
    setDueDate(date);
    setShowCalendar(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-arrebol-terracota';
      case 'pending':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Play;
      case 'pending':
        return Circle;
      default:
        return Circle;
    }
  };

  const modalStyle = {
    position: 'fixed' as const,
    bottom: '90px',
    right: '24px',
    width: '400px',
    maxWidth: 'calc(100vw - 48px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    zIndex: 9999,
    padding: '24px',
    maxHeight: '70vh',
    overflowY: 'auto' as const,
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      style={modalStyle}
      className="animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {initialData ? 'Editar Tarea' : 'Nueva Tarea'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="¿Qué tienes que hacer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-semibold placeholder-gray-400 border-0 bg-transparent focus:outline-none focus:ring-0 px-0"
            autoFocus
          />
        </div>

        <div>
          <textarea
            placeholder="Agregar notas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm placeholder-gray-400 border-0 bg-transparent focus:outline-none focus:ring-0 px-0 resize-none"
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative" ref={priorityDropdownRef}>
            <button
              onClick={() => {
                setShowPriorityDropdown(!showPriorityDropdown);
                setShowStatusDropdown(false);
                setShowCalendar(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Flag size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {PRIORITY_OPTIONS.find(p => p.value === priority)?.label}
              </span>
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
            </button>
            
            {showPriorityDropdown && (
              <div 
                className="task-dropdown"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '0',
                  marginBottom: '4px',
                  minWidth: '12rem',
                  zIndex: 10000
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPriority(option.value);
                      setShowPriorityDropdown(false);
                    }}
                    className="task-dropdown-item flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Flag size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      {option.label}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(option.value)}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowPriorityDropdown(false);
                setShowCalendar(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {(() => {
                const Icon = getStatusIcon(status);
                return <Icon size={16} className={getStatusColor(status)} />;
              })()}
              <span className="text-sm font-medium text-gray-700">
                {STATUS_OPTIONS.find(s => s.value === status)?.label}
              </span>
            </button>
            
            {showStatusDropdown && (
              <div 
                className="task-dropdown"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '0',
                  marginBottom: '4px',
                  minWidth: '12rem',
                  zIndex: 10000
                }}
              >
                {STATUS_OPTIONS.map((option) => {
                  const Icon = getStatusIcon(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatus(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className="task-dropdown-item flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={16} className={getStatusColor(option.value)} />
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowCalendar(!showCalendar);
                setShowPriorityDropdown(false);
                setShowStatusDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Calendar size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {dueDate ? formatDate(dueDate) : 'Sin fecha'}
              </span>
            </button>
          </div>
        </div>

        {showCalendar && (
          <div 
            className="relative"
            style={{
              position: 'absolute',
              bottom: '100%',
              right: '0',
              marginBottom: '16px',
              zIndex: 10001
            }}
          >
            <CalendarPicker
              selectedDate={dueDate}
              onDateSelect={handleDateSelect}
              className="shadow-lg border border-gray-200 rounded-lg bg-white"
            />
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-arrebol-terracota-500 hover:bg-arrebol-terracota-600 text-white px-6 py-3 rounded-full font-display transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <span>{initialData ? 'Actualizar' : 'Crear'}</span>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
