import React, { useEffect, useRef, useState } from 'react';
import TodoItems from './TodoItems';
import { LuListTodo } from "react-icons/lu";
import { FaTrashAlt } from "react-icons/fa";
import Sortable from 'sortablejs';
import axios from 'axios';

const Todo = () => {
    const [showAddSection, setShowAddSection] = useState(false);
    const [todoList, setTodoList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [error, setError] = useState(''); // Error state
    const todoListRef = useRef();
    const inputRef = useRef();

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const response = await axios.get('https://66a8916ae40d3aa6ff5881db.mockapi.io/TodoList');
                const storedOrder = JSON.parse(localStorage.getItem('todoOrder')) || [];
                if (storedOrder.length > 0) {
                    const orderedTodos = storedOrder.map(id => response.data.find(todo => todo.id === id)).filter(Boolean);
                    setTodoList(orderedTodos);
                } else {
                    setTodoList(response.data);
                }
            } catch (error) {
                setError('Lỗi! Không thể sắp xếp Danh Sách');
                // Gửi lỗi lên server
                fetch('https://66a8916ae40d3aa6ff5881db.mockapi.io/Logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `Error fetching todos: ${error.message}`,
                        date: new Date().toISOString()
                    }),
                }).catch(err => console.error('Error logging to server:', err));
            }
        };

        fetchTodos();
    }, []);

    useEffect(() => {
        const sortable = Sortable.create(todoListRef.current, {
            animation: 150,
            ghostClass: 'blue-background-class',
            onEnd: (event) => {
                const updatedTodos = [...todoList];
                const [movedItem] = updatedTodos.splice(event.oldIndex, 1);
                updatedTodos.splice(event.newIndex, 0, movedItem);
                setTodoList(updatedTodos);
                localStorage.setItem('todoOrder', JSON.stringify(updatedTodos.map(todo => todo.id)));
            },
        });

        return () => sortable.destroy();
    }, [todoList]);

    const handleAddItem = () => {
        const inputText = inputRef.current.value;
        if (!inputText) {
            alert('Vui lòng nhập tên mục cần thêm');
            return;
        }

        const newTodo = { name: inputText, status: false };
        axios.post('https://66a8916ae40d3aa6ff5881db.mockapi.io/TodoList', newTodo)
            .then(response => {
                setTodoList(prev => {
                    const updatedList = [...prev, response.data];
                    localStorage.setItem('todoOrder', JSON.stringify(updatedList.map(todo => todo.id)));
                    return updatedList;
                });
                inputRef.current.value = "";
                setShowAddSection(false);
                setError(''); // Clear error on success
            })
            .catch(error => {
                setError('Lỗi! Không thể thêm vào Danh Sách');
                // Gửi lỗi lên server
                fetch('https://66a8916ae40d3aa6ff5881db.mockapi.io/Logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `Error adding item: ${error.message}`,
                        date: new Date().toISOString()
                    }),
                }).catch(err => console.error('Error logging to server:', err));
            });
    };

    const handleDeleteItem = (id) => {
        axios.delete(`https://66a8916ae40d3aa6ff5881db.mockapi.io/TodoList/${id}`)
            .then(() => {
                setTodoList(prev => {
                    const updatedList = prev.filter(todo => todo.id !== id);
                    localStorage.setItem('todoOrder', JSON.stringify(updatedList.map(todo => todo.id)));
                    return updatedList;
                });
                setError(''); // Clear error on success
            })
            .catch(error => {
                setError('Lỗi! Không thể xóa khỏi Danh Sách');
                // Gửi lỗi lên server
                fetch('https://66a8916ae40d3aa6ff5881db.mockapi.io/Logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `Error deleting item: ${error.message}`,
                        date: new Date().toISOString()
                    }),
                }).catch(err => console.error('Error logging to server:', err));
            });
    };

    const toggleCompleted = (id) => {
        setTodoList(prev => {
            const updatedTodos = prev.map(todo => {
                if (todo.id === id) {
                    const updatedTodo = { ...todo, status: !todo.status };
                    axios.put(`https://66a8916ae40d3aa6ff5881db.mockapi.io/TodoList/${id}`, updatedTodo)
                        .catch(error => {
                            setError('Lỗi! Không thể sửa');
                            fetch('https://66a8916ae40d3aa6ff5881db.mockapi.io/Logs', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    content: `Error toggling completion: ${error.message}`,
                                    date: new Date().toISOString()
                                }),
                            }).catch(err => console.error('Error logging to server:', err));
                        });
                    return updatedTodo;
                }
                return todo;
            });
            setShowIcons(updatedTodos.some(todo => todo.status)); // Show delete button if any todos are selected
            setError(''); // Clear error on success
            return updatedTodos;
        });
    };

    const updateTodo = (id, newName) => {
        axios.put(`https://66a8916ae40d3aa6ff5881db.mockapi.io/TodoList/${id}`, { name: newName })
            .then(() => {
                setTodoList(prev => prev.map(todo => todo.id === id ? { ...todo, name: newName } : todo));
                setError(''); // Clear error on success
            })
            .catch(error => {
                setError('Lỗi! Không thể cập nhật Todo');
                // Gửi lỗi lên server
                fetch('https://66a8916ae40d3aa6ff5881db.mockapi.io/Logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `Error updating todo: ${error.message}`,
                        date: new Date().toISOString()
                    }),
                }).catch(err => console.error('Error logging to server:', err));
            });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectAll = () => {
        const newSelectionState = !isAllSelected;
        setIsAllSelected(newSelectionState);
        const updatedTodos = todoList.map(todo => ({ ...todo, status: newSelectionState }));
        setTodoList(updatedTodos);
        setShowIcons(newSelectionState); // Show delete button if all todos are selected
    };

    const handleDeleteSelected = () => {
        const selectedTodos = todoList.filter(todo => todo.status);
        selectedTodos.forEach(todo => {
            axios.delete(`https://66a8916ae40d3aa6ff5881db.mockapi.io/TodoList/${todo.id}`)
                .then(() => {
                    setTodoList(prev => {
                        const updatedList = prev.filter(item => item.id !== todo.id);
                        localStorage.setItem('todoOrder', JSON.stringify(updatedList.map(todo => todo.id)));
                        return updatedList;
                    });
                    setError(''); // Clear error on success
                })
                .catch(error => {
                    setError('Lỗi! Không thể xóa những Todos bạn chọn');
                    // Gửi lỗi lên server
                    fetch('https://66a8916ae40d3aa6ff5881db.mockapi.io/Logs', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            content: `Error deleting selected todos: ${error.message}`,
                            date: new Date().toISOString()
                        }),
                    }).catch(err => console.error('Error logging to server:', err));
                });
        });
        setShowIcons(false);
    };

    const filteredTodos = todoList.filter(todo => todo.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const completedPercentage = todoList.length ? (todoList.filter(todo => todo.status).length / todoList.length) * 100 : 0;

    return (
        <div className='bg-white place-self-center w-full max-w-[900px] flex flex-col p-6 min-h-[600px] rounded-xl'>
            <div className='flex items-center mt-1 gap-2'>
                <LuListTodo className='w-7 h-7' />
                <h1 className='text-[30px] font-semibold'>Todo List</h1>
            </div>

            {error && <p className="text-red-500 text-center mt-4">{error}</p>} {/* Display error if present */}

            <input
                type='text'
                placeholder='Tìm kiếm...'
                value={searchTerm}
                onChange={handleSearchChange}
                className='w-full text-[19px] p-3 rounded-lg mt-2 border-2 border-blue-500'
            />

            <div className='flex items-center mt-4'>
                <input
                    type='checkbox'
                    className='form-checkbox h-5 w-5 mr-4 text-blue-600'
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                />
                {showIcons && (
                    <FaTrashAlt className='w-5 cursor-pointer' onClick={handleDeleteSelected} />
                )}
            </div>

            <div className='w-full h-4 bg-zinc-200 rounded-full mt-4 mb-4 items-center'>
                <div
                    className='h-full rounded-full'
                    style={{
                        width: `${completedPercentage}%`,
                        backgroundColor: completedPercentage === 100 ? 'green' : 'blue',
                    }}
                ></div>
                <p className='text-[15px]'>Hoàn thành: {completedPercentage.toFixed(2)}%</p>
            </div>

            <div ref={todoListRef} className='space-y-4'>
                {filteredTodos.length > 0 ? (
                    filteredTodos.map(item => (
                        <TodoItems
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            status={item.status}
                            deleteTodo={handleDeleteItem}
                            toggleCompleted={toggleCompleted}
                            updateTodo={updateTodo}
                        />
                    ))
                ) : (
                    <p className="text-red-500 text-center mt-4">Không tìm thấy Todo nào</p>
                )}
            </div>

            <div className='flex flex-col mt-1 gap-2'>
                {!showAddSection && (
                    <button
                        onClick={() => setShowAddSection(true)}
                        className='w-96 bg-green-500 text-white p-3 pr-10 rounded-md mt-2'
                    >
                        Thêm mục mới
                    </button>
                )}
                {showAddSection && (
                    <>
                        <input
                            ref={inputRef}
                            type='text'
                            placeholder='Thêm một mục mới'
                            className='w-96 text-[19px] p-3 rounded-md mt-2 border-2 border-blue-500'
                        />
                        <div className='flex gap-2'>
                            <button
                                onClick={handleAddItem}
                                className='bg-blue-500 text-white p-3 rounded-md mt-2'
                            >
                                Thêm
                            </button>
                            <button
                                onClick={() => setShowAddSection(false)}
                                className='bg-gray-500 text-white p-3 rounded-md mt-2'
                            >
                                Hủy
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Todo;
