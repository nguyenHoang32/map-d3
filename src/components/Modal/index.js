import styles from "./index.module.scss";
import cn from "classnames/bind";
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import React from "react";
const cx = cn.bind(styles);
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const Modal = ({text,resetFilter, showButton}) => {
  return(
    <div className={cx("container")}>
      <div>
      <div className={cx("text")}>{text}</div>
      {/* <Spin indicator={antIcon} /> */}
      <div>
      {showButton && <button className={cx("btn")} onClick={resetFilter}>Clear Filter</button>}
      </div>
      </div>
     
    </div>
  )
}
export default Modal;