import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

const TodoForm = ({ todo, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: null
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        status: todo.status || 'pending',
        priority: todo.priority || 'medium',
        due_date: todo.due_date ? new Date(todo.due_date) : null
      });
    }
  }, [todo]);
  
  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' }
  ];
  
  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (formData.title.trim()) {
      // Format date to ISO string if it exists
      const formattedData = {
        ...formData,
        due_date: formData.due_date ? formData.due_date.toISOString().split('T')[0] : null
      };
      
      onSave(formattedData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="field mb-4">
        <label htmlFor="title" className="block mb-2">Title</label>
        <InputText
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={submitted && !formData.title.trim() ? 'p-invalid' : ''}
        />
        {submitted && !formData.title.trim() && (
          <small className="p-error">Title is required</small>
        )}
      </div>
      
      <div className="field mb-4">
        <label htmlFor="description" className="block mb-2">Description</label>
        <InputTextarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>
      
      <div className="formgrid grid">
        <div className="field col-12 md:col-6 mb-4">
          <label htmlFor="status" className="block mb-2">Status</label>
          <Dropdown
            id="status"
            name="status"
            value={formData.status}
            options={statusOptions}
            onChange={handleChange}
            placeholder="Select Status"
          />
        </div>
        
        <div className="field col-12 md:col-6 mb-4">
          <label htmlFor="priority" className="block mb-2">Priority</label>
          <Dropdown
            id="priority"
            name="priority"
            value={formData.priority}
            options={priorityOptions}
            onChange={handleChange}
            placeholder="Select Priority"
          />
        </div>
      </div>
      
      <div className="field mb-4">
        <label htmlFor="due_date" className="block mb-2">Due Date</label>
        <Calendar
          id="due_date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
          showIcon
          dateFormat="yy-mm-dd"
        />
      </div>
      
      <div className="flex justify-content-end gap-2 mt-4">
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          className="p-button-text" 
          onClick={onCancel} 
          type="button"
        />
        <Button 
          label="Save" 
          icon="pi pi-check" 
          type="submit"
        />
      </div>
    </form>
  );
};

export default TodoForm;