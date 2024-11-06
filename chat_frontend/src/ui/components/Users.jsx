import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Badge } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchUsers } from '../../lib/api';
import { Link } from 'react-router-dom';

const Users = () => {
    const [currentUsers, setCurrentUsers] = useState([]);

    useEffect(() => {
        const getCurrentUsers = async () => {
            try {
                const UsersData = await fetchUsers();
                setCurrentUsers(UsersData);
            } catch (error) {
                console.log(error);
            }
        }
        getCurrentUsers();
    }, []);

    return (
        <List>
            {currentUsers.map(user => {
                return (
                    <Link key={user.userId} to={`/chats/${user.userId}`}>
                        <ListItem 
                        sx={{ '& .MuiListItemText-primary': { color: 'common.white' }}}>
                            <ListItemAvatar>
                                <Badge variant={user.online? "dot": null} color='success' overlap='circular'
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}>
                                    <Avatar alt='smart splendid' src='./profile-image.jpg' />
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText primary={user.username} />
                        </ListItem>
                    </Link>
                )
            })}
        </List>
    )
}

export default Users;