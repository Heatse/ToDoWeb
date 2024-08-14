import React, { useState, useEffect } from 'react';
import { FaTrashAlt } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";

const TodoItems = ({ name, id, status, deleteTodo, toggleCompleted, updateTodo }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(name);
    const [isChecked, setIsChecked] = useState(status);

    useEffect(() => {
        setEditText(name);
        setIsChecked(status);
    }, [name, status]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleUpdate = () => {
        setIsEditing(false);
        updateTodo(id, editText);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(name);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleUpdate();
        }
    };

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        toggleCompleted(id);
    };

    return (
        <div className='flex items-center my-6 gap-2 group bg-neutral-100 p-2 rounded-lg'>
            <div className='flex flex-1 items-center cursor-pointer'>
                <input
                    type='checkbox'
                    className='form-checkbox h-5 w-5 text-blue-600 mr-4'
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                {isEditing ? (
                    <input
                        type='text'
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className='text-[17px] text-slate-700'
                        autoFocus
                    />
                ) : (
                    <p className={`text-slate-700 text-[17px] ${isChecked ? 'line-through' : ''}`}>{name}</p>
                )}
            </div>

            {isEditing ? (
                <div className='flex gap-2'>
                    <button
                        onClick={handleUpdate}
                        className='bg-blue-500 text-white p-1 rounded-md'
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancelEdit}
                        className='bg-gray-500 text-white p-1 rounded-md'
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                    <FaTrashAlt onClick={() => deleteTodo(id)} className='w-4 cursor-pointer' />
                    <IoIosSettings onClick={handleEdit} className='w-4 cursor-pointer' />
                </div>
            )}
        </div>
    );
};

export default TodoItems;
