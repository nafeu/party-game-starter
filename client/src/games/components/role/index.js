import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles(theme => ({
  roleContainer: {
    position: "absolute",
    bottom: "0%",
    left: "0%",
    width: "20%",
  },
  role: {
    position: "relative",
    width: "100%",
    fontWeight: "100",
    backgroundColor: theme.colorDark,
  },
  infoContainer: {
    width: "auto",
    padding: "5px"
  },
  roleName: {
    fontWeight: "bold"
  },
  codeword: {
    fontWeight: "bold"
  }
}));

function Role({ gamerole, codeword, color }) {
  const classes = useStyles();

  return (
    <div className={classes.roleContainer}>
      <div className={classes.role}>
        <div className={classes.infoContainer}>
          Role: <span className={classes.roleName} style={{ color }}>{gamerole}</span>
          <br/>
          Codeword: <span className={classes.codeword} style={{ color }}>{codeword}</span>
        </div>
      </div>
    </div>
  );
}

export default Role;