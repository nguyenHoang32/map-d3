import styles from "./index.module.scss";
import cn from "classnames/bind";
import React from "react";
const cx = cn.bind(styles);

const Modal = ({text,resetFilter, showButton}) => {
  return(
    <div className={cx("container")}>
      <div>
      <div className={cx("text")}>{text}</div>
      
      <div>
      {showButton && <button className={cx("btn")} onClick={resetFilter}>Clear Filter</button>}
      </div>
      </div>
     
    </div>
  )
}
export default Modal;