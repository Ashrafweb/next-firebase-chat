import React, { useState, useEffect } from 'react';
import { Modal, TextField, Autocomplete, ListItem, ListItemText, Avatar, Typography, Box, Button, CircularProgress } from '@mui/material';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";

const UserSearchModal = ({ open, onClose, onUserSelect, excludeEmails = [], title = "Find User" }) => {
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const searchUsers = async () => {
            const searchTerm = searchInput.toLowerCase().trim();
            if (searchTerm.length < 2) {
                setUsers([]);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const usersQuery = query(
                    collection(db, "users"),
                    where("email", ">=", searchTerm),
                    where("email", "<=", searchTerm + "\uf8ff"),
                    limit(10)
                );

                const snapshot = await getDocs(usersQuery);
                const filteredUsers = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => !excludeEmails.includes(user.email));

                setUsers(filteredUsers);
            } catch (err) {
                console.error("Search error:", err);
                setError('Failed to search users. Please try again.');
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchInput, excludeEmails]);

    const handleSelect = (user) => {
        setSelectedUser(user);
        setSearchInput(user?.email || '');
    };

    const handleSubmit = () => {
        if (selectedUser) {
            onUserSelect?.(selectedUser);
            handleClose();
        }
    };

    const handleClose = () => {
        setSearchInput('');
        setSelectedUser(null);
        setUsers([]);
        setError('');
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="user-search-modal"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4
            }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    {title}
                </Typography>

                <Autocomplete
                    freeSolo
                    value={selectedUser}
                    inputValue={searchInput}
                    onInputChange={(_, value) => setSearchInput(value)}
                    onChange={(_, user) => handleSelect(user)}
                    options={users}
                    getOptionLabel={(user) => user.email || ''}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    loading={loading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search by email"
                            fullWidth
                            error={!!error}
                            helperText={error}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading && <CircularProgress size={20} />}
                                        {params.InputProps.endAdornment}
                                    </>
                                )
                            }}
                        />
                    )}
                    renderOption={(props, user) => (
                        <ListItem {...props}>
                            <Avatar
                                src={user.photoURL}
                                alt={user.displayName || user.email}
                                sx={{ mr: 2 }}
                            />
                            <ListItemText
                                primary={user.email}
                                secondary={user.displayName || ''}
                            />
                        </ListItem>
                    )}
                />

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!selectedUser}
                    >
                        Select User
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default UserSearchModal;