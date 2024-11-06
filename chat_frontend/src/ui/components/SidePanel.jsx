import { Avatar, Box, ClickAwayListener, Grow, IconButton, MenuItem, MenuList, Paper, Popper } from '@mui/material/';
import { Dehaze, Settings } from '@mui/icons-material';
import { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const SidePanel = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const { currentUser } = useContext(UserContext)

    if (!currentUser) <div>Loading...</div>

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        setAnchorEl(null);
        navigate("/login");
    }

    return (
        <Box display="flex" justifyContent="space-between" padding="8px" alignItems="center" flexDirection="column">
            <Dehaze />

            <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="center"
            >
                <IconButton>
                    <Settings />
                </IconButton>
                <div>
                <Avatar sx={{width: "25px", height: "25px"}} src={"/uploads/profile-image.jpg"} alt='smart splendid' onClick={handleAvatarClick} />
                    <Popper
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        role={undefined}
                        placement="right-end"
                        transition
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom-start' ? 'left top' : 'left bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList
                                            autoFocusItem={Boolean(anchorEl)}
                                            id="composition-menu"
                                            aria-labelledby="composition-button"
                                        >
                                            <MenuItem onClick={handleClose}>{currentUser.username}</MenuItem>
                                            <MenuItem onClick={handleClose}>Add Account</MenuItem>
                                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </div>

            </Box>
        </Box>

    );
};

export default SidePanel;