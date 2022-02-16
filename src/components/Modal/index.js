import styles from "./index.module.scss";
import cn from "classnames/bind";
import React from "react";
import { Spin } from 'antd';

const cx = cn.bind(styles);


const Modal = ({show, text,resetFilter, showButton}) => {
  return(
    <div className={cx("container")}>
      <div>
      <div className={cx("text")}>{text}</div>
      <div className={cx("loading", !show && cx("hide"))}><Spin /></div>
      <div>
      {showButton && <button className={cx("btn")} onClick={resetFilter}>Clear Filter</button>}
      </div>
      </div>
     
    </div>
  )
}
export default Modal;