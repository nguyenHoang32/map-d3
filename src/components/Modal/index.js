import styles from "./index.module.scss";
import cn from "classnames/bind";
import React from "react";
const cx = cn.bind(styles);

const Modal = ({text,resetFilter}) => {
  return(
    <div className={cx("container")}>

      <div className={cx("text")}>{text}</div>
      <button className={cx("btn")} onClick={resetFilter}>Clear Filter</button>
    </div>
  )
}
export default Modal;