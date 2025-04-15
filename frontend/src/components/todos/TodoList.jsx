import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Menu } from 'primereact/menu';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '../../context/AuthContext';
import TodoForm from './TodoForm';
import api from '../../services/api';

const TodoList = ({ toast }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formDialog, setFormDialog] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const { user, logout } = useAuth();
  const menu = useRef(null);

  const menuItems = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => {}
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => logout()
    }
  ];

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/todos');
      setTodos(response.data);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch todos',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTodo = async (todoData) => {
    try {
      let response;
      
      if (selectedTodo) {
        // Update existing todo
        response = await api.put(`/api/todos/${selectedTodo.id}`, todoData);
        
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === selectedTodo.id ? response.data : todo
        ));
        
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Todo updated successfully',
          life: 3000
        });
      } else {
        // Create new todo
        response = await api.post('/api/todos', todoData);
        
        setTodos(prevTodos => [...prevTodos, response.data]);
        
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Todo created successfully',
          life: 3000
        });
      }
      
      setFormDialog(false);
      setSelectedTodo(null);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.error || 'Failed to save todo',
        life: 3000
      });
    }
  };

  const handleDeleteTodo = (todo) => {
    confirmDialog({
      message: 'Are you sure you want to delete this todo?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await api.delete(`/api/todos/${todo.id}`);
          
          setTodos(prevTodos => prevTodos.filter(t => t.id !== todo.id));
          
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Todo deleted successfully',
            life: 3000
          });
        } catch (error) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete todo',
            life: 3000
          });
        }
      }
    });
  };

  const openNew = () => {
    setSelectedTodo(null);
    setFormDialog(true);
  };

  const openEdit = (todo) => {
    setSelectedTodo(todo);
    setFormDialog(true);
  };

  const statusBodyTemplate = (rowData) => {
    const statusMap = {
      'pending': { label: 'Pending', severity: 'warning' },
      'in-progress': { label: 'In Progress', severity: 'info' },
      'completed': { label: 'Completed', severity: 'success' }
    };
    
    const status = statusMap[rowData.status] || statusMap.pending;
    
    return (
      <span className={`p-badge p-badge-${status.severity} p-2`} style={{ 
        borderRadius: '15px',
        whiteSpace: 'nowrap',
      }}>
        {status.label}
      </span>
    );
  };

  const priorityBodyTemplate = (rowData) => {
    const priorityMap = {
      'low': { label: 'Low', severity: 'info' },
      'medium': { label: 'Medium', severity: 'warning' },
      'high': { label: 'High', severity: 'danger' }
    };
    
    const priority = priorityMap[rowData.priority] || priorityMap.medium;
    
    return (
      <span className={`p-badge p-badge-${priority.severity} p-2 `} style={{ 
        borderRadius: '15px',
        whiteSpace: 'nowrap'
      }}>
        {priority.label}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-success p-button-sm" 
          onClick={() => openEdit(rowData)} 
          tooltip="Edit" 
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-rounded p-button-danger p-button-sm" 
          onClick={() => handleDeleteTodo(rowData)} 
          tooltip="Delete" 
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between">
      <h2 className="m-0">Todo List</h2>
      <div className="flex align-items-center gap-2">
        <Button label="New" icon="pi pi-plus" onClick={openNew} />
        <Button 
          icon="pi pi-bars" 
          className="p-button-rounded p-button-outlined" 
          onClick={(e) => menu.current.toggle(e)} 
        />
        <Menu model={menuItems} popup ref={menu} />
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <Card className="shadow-4">
        <DataTable 
          value={todos} 
          header={header}
          loading={loading}
          paginator 
          rows={10} 
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="No todos found"
          responsiveLayout="scroll"
        >
          <Column field="id" header="ID" sortable style={{ width: '5%' }} />
          <Column field="title" header="Title" sortable style={{ width: '20%' }} />
          <Column field="description" header="Description" sortable style={{ width: '30%' }} />
          <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: '12%' }} />
          <Column field="priority" header="Priority" body={priorityBodyTemplate} sortable style={{ width: '12%' }} />
          <Column field="due_date" header="Due Date" sortable style={{ width: '13%' }} />
          <Column body={actionBodyTemplate} style={{ width: '8%' }} />
        </DataTable>
      </Card>
      
      <Dialog
        visible={formDialog}
        header={selectedTodo ? 'Edit Todo' : 'Create Todo'}
        style={{ width: '500px' }}
        modal
        className="p-fluid"
        onHide={() => setFormDialog(false)}
      >
        <TodoForm
          todo={selectedTodo}
          onSave={handleSaveTodo}
          onCancel={() => setFormDialog(false)}
        />
      </Dialog>
      
      <ConfirmDialog />
    </div>
  );
};

export default TodoList;