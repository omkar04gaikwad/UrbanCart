import React, { useState } from 'react';
import { Button, Popper, Paper, Typography, ClickAwayListener } from '@mui/material';

const PopperExample = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <div>
      <Button variant="contained" onClick={handleClick}>
        Toggle Popper
      </Button>
      <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom">
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper elevation={3} style={{ padding: '16px', maxWidth: '200px' }}>
            <Typography variant="body1">This is a popper component.</Typography>
            <Button onClick={handleClickAway} style={{ marginTop: '8px' }}>
              Close Popper
            </Button>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
};

export default PopperExample;
