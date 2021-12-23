import styles from "./index.module.scss";
import cn from "classnames/bind";
import React from "react";
const cx = cn.bind(styles);

const Modal = ({text}) => {
  return(
    <div className={cx("container")}>
      <div className={cx("text")}>{text}</div>
    </div>
  )
}
export default Modal;