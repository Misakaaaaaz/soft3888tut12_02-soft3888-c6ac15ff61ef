import React from 'react';
import { render, screen, fireEvent,within } from '@testing-library/react';
import UserList from '../app/usermanagement/UserList';
import '@testing-library/jest-dom';

describe('UserList Component', () => {
    test('renders the UserList component with initial users', () => {
        const initialUsers = [
            { name: 'Mark', username: 'Otto', level: '@mdo' },
            { name: 'Jacob', username: 'Thornton', level: '@fat' },
            { name: 'Larry the Bird', username: '', level: '@twitter' }
        ];

        render(<UserList initialUsers={initialUsers} />);

        expect(screen.getByText(/Mark/i)).toBeInTheDocument();
        expect(screen.getByText(/Otto/i)).toBeInTheDocument();
        expect(screen.getByText(/Jacob/i)).toBeInTheDocument();
        expect(screen.getByText(/Thornton/i)).toBeInTheDocument();
    });

    test('renders a message when no users are provided', () => {
        render(<UserList initialUsers={[]} />);

        // 检查是否显示 "No users found" 消息
        expect(screen.getByText(/No users found/i)).toBeInTheDocument();
    });

    // test('allows users to be added via the form', () => {
    //     render(<UserList initialUsers={[]} />);

    //     // 打开表单
    //     fireEvent.click(screen.getByText(/Add User/i));

    //     // 填写表单
    //     fireEvent.change(screen.getByLabelText('Name', { selector: 'input' }), { target: { value: 'John Doe' } });
    //     fireEvent.change(screen.getByLabelText('Username', { selector: 'input' }), { target: { value: 'johndoe' } });
    //     fireEvent.change(screen.getByLabelText('Level', { selector: 'input' }), { target: { value: '@johndoe' } });

    //     // 提交表单
    //     fireEvent.click(screen.getByText(/Add User/i));

    //     // 检查新用户是否被添加到列表中
    //     expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    //     expect(screen.getByText(/johndoe/i)).toBeInTheDocument();
    //     expect(screen.getByText(/@johndoe/i)).toBeInTheDocument();
    // });

    test('allows a specific user to be deleted from the list', () => {
        const initialUsers = [
            { name: 'Mark', username: 'Otto', level: '@mdo' },
            { name: 'Jacob', username: 'Thornton', level: '@fat' }
        ];
    
        render(<UserList initialUsers={initialUsers} />);
    
        const jacobRow = screen.getByText('Jacob').closest('tr');
        const deleteButton = within(jacobRow).getByText(/Delete/i);
    
        fireEvent.click(deleteButton);
    
        expect(screen.queryByText(/Jacob/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Mark/i)).toBeInTheDocument();
    });
    

    test('filters users based on search input', () => {
        const initialUsers = [
            { name: 'Mark', username: 'Otto', level: '@mdo' },
            { name: 'Jacob', username: 'Thornton', level: '@fat' },
            { name: 'Larry the Bird', username: '', level: '@twitter' }
        ];

        render(<UserList initialUsers={initialUsers} />);

        // 搜索 "Jacob"
        fireEvent.change(screen.getByPlaceholderText(/Search by name/i), { target: { value: 'Jacob' } });

        // 检查筛选后的用户列表
        expect(screen.getByText(/Jacob/i)).toBeInTheDocument();
        expect(screen.queryByText(/Mark/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Larry the Bird/i)).not.toBeInTheDocument();
    });
});
