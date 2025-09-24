package com.hadluo.shop.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@TableName("shipping_template")
@Data
public class ShippingTemplate {
    
    @TableId(value = "template_id", type = IdType.AUTO)
    private Integer templateId;

    private String name;

    private Integer isFreeShipping;
}