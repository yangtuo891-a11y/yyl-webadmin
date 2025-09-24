package com.hadluo.shop.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@ApiModel("运费规则实体")
@TableName("shipping_rule")
@Data
public class ShippingRule {
    
    @ApiModelProperty("主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty("运费模板ID")
    private Integer templateId;

    @ApiModelProperty("城市ID")
    private Integer cityId;

    @ApiModelProperty("首重运费")
    private Double firstFee;
}