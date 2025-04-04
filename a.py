    def save_state(self) -> dict:
        """ 保存当前寄存器状态 """
        return {reg: self.mu.reg_read(reg) for reg in self.reg_list}
 
    def restore_state(self, state: dict) -> None:
        """ 恢复寄存器状态 """
        for reg, value in state.items():
            self.mu.reg_write(reg, value)
 
    def clear_state(self) -> None:
        """ 清空所有寄存器，并重置 csel 标志 """
        self.csel_handled = False
        for reg in self.reg_list:
            self.mu.reg_write(reg, 0)
