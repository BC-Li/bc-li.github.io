---
title: Space Invaders on FPGA
layout: single
category: cn
header:
  overlay_image: /assets/images/2.jpg
author_profile: true
toc: true
---
## Alien.v 外星人游戏逻辑

```verilog
module alien(
input [23:0]aliennumber;    // 外星人的数目
    input clk,rst;              // 时钟和复位信号
input bulletflying,startscreen,gameover,frontalive; //  依次为
子弹是否正在飞行，是否在开始界面，是否已经gg，前面两个外星人是不是还活着（第一排和第二排用，防止前面有外星人时就开火）
    input [9:0] startX;     // 子弹开始时的横坐标
    input [8:0] startY;     // 子弹开始时的纵坐标
    input [9:0] bulletX;        // 子弹现在的横坐标
    input [8:0] bulletY;        // 子弹现在的纵坐标
    input [9:0] width;      // 外星人的图片宽度（用于伤害判定）
    input [27:0] firefreq;  // 开火频率
    output reg [9:0]alienX; // 输出外星人的横纵坐标 
    output reg [8:0]alienY;
    output reg alienalive,hit,alienfire; // 输出外星人的生命状态，是否被击中，以及外星人开火信号
);
    
    reg [23:0] counter;         // 分频时钟
    reg [27:0] firecounter;  // 开火分频时钟
    reg speed,direction;        // speed 是移动的速度， direction 是控制左右
    wire [10:0]aliencounter;    // 外星人分频时钟
    
always@(posedge clk or posedge rst)     //  时序逻辑
    begin
        if(rst) //  复位状态均置零
        begin
            firecounter <= 0;
            alienfire <= 0;
        end 
else begin
            if(alienalive && ~frontalive && ~startscreen && ~gameover) begin        // 如果活着，前方没有活外星人而且没在开始/结束页面的时候就定时开火
                if(firecounter == firefreq) begin   // 每隔一段时间开火
                    firecounter <= 0;               
                    alienfire <= 1; 
                end else begin
                    firecounter <= firecounter + 1'b1;
                    alienfire <= 0;
                end
            end else begin      //  其余时间不开火
                firecounter <= 0;
                alienfire <= 0;
            end
        end
    end
    
    always@(posedge clk or posedge rst) // 伤害判定
    begin
        if(rst)
        begin   // 复位时复活外星人
            alienalive <= 1'b1;
            hit <= 0;
        end else begin  // 没复位的时候开始伤害判定
            if(bulletflying && alienalive &&(((bulletX >= alienX -2)&&(bulletX <= alienX + width + 2))&&(bulletY == alienY)))
begin           // 当子弹到alien图片的这个区域的时候启动伤害判定
                alienalive <= 0;
                hit <= 1'b1;        // alien 被打了
            end else begin
                hit <= 0;           // 其余时间没被打
            end
        end
    end
    assign aliencounter = aliennumber;  //  存储外星人数目
    always@(posedge clk or posedge rst)
    begin
        if(rst) //  复位时重置外星人位置
        begin
            alienX <= startX;       
        end else if(counter >= (24'd1000_000)) // 用一个counter降频
            begin
                 speed <= 1'b1;
                 counter <= 0;
             end else 
             begin
                if(direction)   // 向左还是向右看direction的值
                begin
                    counter <= counter + 6 - aliennumber  ; // 外星人的移动速度随着场上alien数减少而增加
  alienX <= startscreen? alienX: (alienX + speed); //   不在游戏场景内外星人不动，若动就向右
speed <= 0;
                end else 
                begin
                    counter <= counter + 6 - aliennumber  ;
                    alienX <= startscreen? alienX: (alienX - speed);// direction为0时外星人向左
                    speed <= 0;
                end
            end
        end
    
    
    always@(posedge clk or posedge rst)begin    // 控制外星人纵向移动的逻辑，与横向移动类似
        if(rst)
        begin
            direction <= 0;
            alienY <= startY;
        end else begin
            if(alienX == startX - 170 && direction == 0) begin
                direction <= 1'b1;  // X到边界就变向
                alienY <= (gameover) ? alienY : (alienY + 20); // 同时纵坐标下移
            end else if(alienX == startX + 50 && direction == 1)begin
                direction <= 0;
                alienY <= (gameover) ? alienY : alienY + 20;
            end
        end
    end
   
endmodule
```

## Debounce_t.v 信号去毛刺

```Verilog
module debounce(input reset, clock, noisy, output reg clean); 

   reg [19:0] count;
   reg temp;
   wire [19:0] DELAY;
   assign DELAY = 20'd1000000;
   always @ (posedge clock or posedge reset)
        if(reset == 1'b1)
            begin   
                count <= 20'b0;
                clean <= 1'b0;
                temp <= 1'b0;
            end
        else 
            begin
                if(noisy)       //  输入带毛刺的信号               
                    begin       
                        if(count == DELAY)  // 计数器到延迟时间
                            begin
                                clean <= temp;  // 输出少毛刺的信号
                            end
                        else
                            begin
                                temp <= noisy;  // 剩余时间不赋值给少毛刺信号，只更新temp变量以及计数器递增
                                clean <= clean;
                                count <= count + 1'b1;
                            end
                    end
                else
                    begin
                        count <= 20'b0;
                        clean <= 1'b0;
                    end
            end
      
endmodule

```

 

##  VGA.v 输出H-SYNC,V-SYNC以及用于Block Memory的内存地址

```Verilog
module VGA(
    input clk;
    input rst;
    output reg [9:0] haddr; // 内存地址，确定图片的区域，用于激励block memory 输出图片
    output reg [8:0] vaddr; 
    output reg active;      // 在绘制区域内输出active信号
    output hsync;           // H-SYNC 信号
    output vsync;           // V-SYNC 信号
);

    parameter VA_END = 479;          
    parameter VS_STA = VA_END + 10;  
    parameter VS_END = VS_STA + 2;   
    parameter SCREEN = 524; 

    //  分频信号 
    reg divcounter_H; 
    reg divcounter_V;
    reg [10:0] counter_H; 
    reg [19:0]counter_V;

    always@(posedge clk or posedge rst)
    begin
        if(rst)
        begin
            counter_H = 11'b0;
        end
        else 
        begin
            if(counter_H == 1599) // 0-1599 循环
            begin
                counter_H = 11'b00;
            end
            else
            begin
                counter_H = counter_H + 1'b1;   
            end
        end
    end


    assign hsync = ~((h_count >= HS_STA) & (h_count < HS_END));
    assign vsync = ~((v_count >= VS_STA) & (v_count < VS_END));

    always@(posedge clk or posedge rst)
    begin
        if(rst)
        begin
            divcounter <= 0;
            haddr <= 7'b0;
            active <= 0;
        end
        else
        begin
            if((counter > 11'd289) && (counter < 11'd1568)) // 此时输出Haddr信号
            begin
                  active <= 1'b1;
                divcounter <= divcounter + 1'b1;
                if(divcounter_H == 0)begin
                     haddr <= haddr + 1'b1;  // 0 - 640
                end
            end 
            else 
            begin
                haddr = 7'b0;
                divcounter_H <= 0;
                active <= 0;

            end
        end
    end

    always@(posedge clk or posedge rst)
    begin
        if(rst)
        begin
            counter_V <= 20'b0;
        end
        else 
        begin
            if(counter_V == 12410463)
            begin
                counter_V <= 20'b0;
            end
            else
            begin
                counter_V <= counter_V + 1'b1;
            end
        end
    end

    always@(posedge clk or posedge rst)
    begin
        if(rst)
        begin
            vaddr <= 7'b0;
            divcounter_V <= 0;
            active <= 0;
        end
        else
        begin

            if((counter_V > 20'd49600) && (counter_V < 20'd817601))
            begin
            active <= 1'b1;
            if(divcounter == 11'd1599)
                begin
                    divcounter <= 0;
                    if(vaddr == 9'd479)
                    begin
                        vaddr <= 0;
                    end
                    else
                    begin
                        vaddr <= vaddr + 1'b1;
                    end
               end else 
               begin
                    divcounter_V <= divcounter_V + 1'b1;
                    vaddr <= vaddr;
                end
            end 
            else
            begin
                vaddr <= 7'b0;
                active <= 0;
            end     
        end
    end

endmodule

```

## Pulse.v 状态机（2状态）

```verilog
module Pulse(input clk, input rst, input level, output reg pulse);
    // 处理按键状态
   reg [23:0] counter;
   reg [1:0] state;
   reg [1:0] nextstate;
   parameter S0 = 2'b00;
   parameter S1 = 2'b01;
   
  always @(posedge clk)
      begin
            case(state)
                S0:
                        begin
                            pulse <= 1'b0;
                            counter <= 0;
                            if(level)begin          // 如果有按下按键
                                nextstate <= S1; // 转S1
                            end
                            else begin
                                nextstate <= S0;    // 不按按键转 S0
                            end
                        end
                S1:
                        begin
                            if(counter == 24'd200_000)begin
                                 pulse <= 1'b1;     // 按键按到一定时间（200000个posedge之后才输出按下按键这个信号）
                                 counter <= 0;
                            end else begin
                                 pulse <= 0;        // 否则不输出
                                 counter <= counter + 1'b1;
                            end
                            if(level)begin
                                nextstate <= S1;
                            end
                            else begin
                                nextstate <= S0;
                            end
                        end
                default: nextstate <= S0;
            endcase
      end
      
      // Set the new state 
    always @(posedge clk, posedge rst)
            begin
                if(rst == 1'b1)
                    state <= 2'b0;
                else
                    state <= nextstate;
    end
endmodule

```

## 子弹逻辑

```Verilog
module bullet(clk,rst,startX,startY,
        bulletX,bulletY,
        bulletX1,bulletY1,  
        bulletX2,bulletY2,
        bulletX3,bulletY3,
        bulletX4,bulletY4,
        bulletX5,bulletY5,
        bulletX6,bulletY6,
        bullet1flying,
        bullet2flying,
        bullet3flying,
        bullet4flying,
        bullet5flying,
        bullet6flying,
        direction,fire,flying,hit,firespeed
        );
    // 将子弹位置硬编码作为输入
    input clk,rst,fire,hit,direction,bullet1flying,bullet2flying,bullet3flying,bullet4flying,bullet5flying,bullet6flying;
    input [9:0]startX,bulletX1,bulletX2,bulletX3,bulletX4,bulletX5,bulletX6;
    input [8:0]startY,bulletY1,bulletY2,bulletY3,bulletY4,bulletY5,bulletY6;
    input [2:0] firespeed;  // 子弹速度
    output reg flying;      // 子弹是否飞行
    output reg [9:0]bulletX; // 输出子弹的横纵坐标
    output reg [8:0]bulletY;    
    reg [23:0] counter;     // 分频计数器
    reg speed,bullethit;        // 飞行速度以及是否被击中的状态

    
    always@(posedge clk or posedge rst)
    begin
        if(rst)
        begin
            bullethit <= 0;     // 复位时子弹恢复未被击中状态
        end else 
        begin                       // 将六个外星人发射的子弹传入模块，并判定如果我方飞船击中了对方的子弹，那么可以击落这发子弹
            if( ((flying && bullet1flying) && ((bulletX >= bulletX1 - 2)&&(bulletX <= bulletX1 + 6))&&(bulletY == bulletY1 + 8))||
                ((flying && bullet2flying) && ((bulletX >= bulletX2 - 2)&&(bulletX <= bulletX2 + 6))&&(bulletY == bulletY2 + 8))||
                ((flying && bullet3flying) && ((bulletX >= bulletX3 - 2)&&(bulletX <= bulletX3 + 6))&&(bulletY == bulletY3 + 8))||
                ((flying && bullet4flying) && ((bulletX >= bulletX4 - 2)&&(bulletX <= bulletX4 + 6))&&(bulletY == bulletY4 + 8))||
                ((flying && bullet5flying) && ((bulletX >= bulletX5 - 2)&&(bulletX <= bulletX5 + 6))&&(bulletY == bulletY5 + 8))||
                ((flying && bullet6flying) && ((bulletX >= bulletX6 - 2)&&(bulletX <= bulletX6 + 6))&&(bulletY == bulletY6 + 8)))
            begin   // 如果被击中
                bullethit <= 1'b1;  //  子弹被击落   
            end else begin
                bullethit <= 0;
            end      
        end
    end
    
    always@(posedge clk or posedge rst)
    begin
        if(rst)
        begin   
            flying <=0;
        end else
        begin
            if(fire)    // 开火了
            begin
                if(flying == 0)begin
                    flying  <= 1;   // 子弹重新飞行
                    bulletX <= startX + 10'd13;     // 子弹初始位置（在飞船中央）
                    bulletY <= startY;
                end
            end 
            if(flying)
            begin   
                bulletY <= direction ? (bulletY - speed):(bulletY + speed); // 子弹复用，如果是外星人发射的就向下飞，如果是我方飞船发射的就向上飞
                if((bulletY == 10) || (bulletY == 470) || hit || bullethit) // 到边沿就停止飞行
                begin
                    flying <= 0;
                end
            end
        end
    end
    
    always@(posedge clk)
        if(flying)
        begin
            if(counter >= 24'd150_000)begin //  每到150000个posedge就开始向下移动，上方的speed变为1
                 speed <= 1'b1;
                 counter <= 0;
            end else begin
                 counter <= counter + 1'b1 + firespeed; // 由开关控制的调速子弹，可以减少counter到达150000 个posedge的时间，让子弹飞行更快
                 speed <= 0;
            end
        end else begin
            counter <= 0;
            speed <= 0;
        end
    
endmodule

```

## 飞船逻辑

```verilog
module spaceship
    (spaceshipX,spaceshipY,btnL,btnR,clk,rst,
    alienbulletX1,alienbulletY1,
    alienbulletX2,alienbulletY2,
    alienbulletX3,alienbulletY3,
    alienbulletX4,alienbulletY4,
    alienbulletX5,alienbulletY5,
    alienbulletX6,alienbulletY6,
    alienbullet1,alienbullet2,
    alienbullet3,alienbullet4,
    alienbullet5,alienbullet6,
    alienhit,liveminus);
    input btnL,btnR;        // 按键信号
    input clk,rst;
    output reg [9:0]spaceshipX; // 输出飞船的横纵坐标
    output reg [8:0]spaceshipY;
    output reg alienhit,liveminus;  // 输出是否被外星人击中
    input alienbullet1,alienbullet2,alienbullet3,alienbullet4,alienbullet5,alienbullet6;        // 硬编码六发外星人子弹是否存活
    input [9:0]alienbulletX1,alienbulletX2,alienbulletX3,alienbulletX4,alienbulletX5,alienbulletX6; // 六发外星人子弹的横纵坐标
    input [8:0]alienbulletY1,alienbulletY2,alienbulletY3,alienbulletY4,alienbulletY5,alienbulletY6;  
     
    always@(posedge clk or posedge rst)
    begin
        if(rst)
        begin
            spaceshipX <= 10'd310;  //   飞船的初始横纵坐标
            spaceshipY <= 9'd400;   
            alienhit <= 0;          //   尚未被外星人打中
            liveminus <= 0;         //   还没掉血
        end
        else begin
            if(btnL) begin                       
                spaceshipX <= (spaceshipX > 11)? (spaceshipX - 10'd1):spaceshipX;   //  如果到了边界再次按按钮不会向左 
            end 
            else if(btnR) begin
                spaceshipX <= (spaceshipX < 598)? (spaceshipX + 9'd1):spaceshipX;   //  到了边界再次按按钮不会向右
            end
            if ((alienbullet1 &&(((alienbulletX1 >= spaceshipX -2)&&(alienbulletX1 <= spaceshipX + 33))&&(alienbulletY1 == spaceshipY)))  || 
                (alienbullet2 &&(((alienbulletX2 >= spaceshipX -2)&&(alienbulletX2 <= spaceshipX + 33))&&(alienbulletY2 == spaceshipY)))  ||
                (alienbullet3 &&(((alienbulletX3 >= spaceshipX -2)&&(alienbulletX3 <= spaceshipX + 33))&&(alienbulletY3 == spaceshipY)))  ||
                (alienbullet4 &&(((alienbulletX4 >= spaceshipX -2)&&(alienbulletX4 <= spaceshipX + 33))&&(alienbulletY4 == spaceshipY)))  ||
                (alienbullet5 &&(((alienbulletX5 >= spaceshipX -2)&&(alienbulletX5 <= spaceshipX + 33))&&(alienbulletY5 == spaceshipY)))  ||
                (alienbullet6 &&(((alienbulletX6 >= spaceshipX -2)&&(alienbulletX6 <= spaceshipX + 33))&&(alienbulletY6 == spaceshipY)))) 
            begin   // 如果子弹存活而且子弹击中了飞船
                alienhit <= 1'b1;   //  被外星人击中一次
                liveminus <= 1'b1;  //  掉血
            end else begin
                alienhit <= 0;  //  没击中就不输出
                liveminus <= 0; 
            end
        end
    end
endmodule

```

## 顶层 + VGA Color

```verilog
module spaceinvader(
    input rst;
    input clk;
    input buttonL,buttonR,fire,startbutton;
    input sw1,sw2;
    output reg [3:0] VGA_R,VGA_G,VGA_B;
    output VGA_hSync,VGA_vSync;
    output [6:0] seg;
    output [7:0] AN;
);
// 输入变量

wire [23:0]aliennumber;
wire locked;
wire cleanL,cleanR,cleanfire;
wire pulseL,pulseR,pulsefire,truepulseL,truepulseR;

wire [9:0]sshipX;
wire [8:0]sshipY;
wire [9:0]rX,arX1,arX2,arX3,arX4,arX5,arX6;
wire [8:0]rY,arY1,arY2,arY3,arY4,arY5,arY6;

reg [13:0]currscore;
reg [8:0]space_addr,life_addr;
wire [8:0]ship_addr;
wire [7:0]space_dout;
reg [9:0]a_addr1,a_addr2,a_addr3,a_addr4,a_addr5;
reg [9:0]a_addr6,a_addr7,a_addr8,a_addr9,a_addr10;
reg [9:0]a_addr11,a_addr12,a_addr13,a_addr14,a_addr15;
wire [7:0]a_dout,a2_dout,a3_dout;

wire rfly,a1border,a2border,a3border,hit,gameover,truefire,hitbullet;
wire ahit,liveminus;
wire totalgameover;
reg livesgameover;
reg [2:0] R,G,B;
reg border,shipborder,scoreborder,bulletborder,gameoverborder,startborder,scorecase,startscreen,winscreen,winborder,lifeborder;
reg abulletborder1,abulletborder2,abulletborder3,abulletborder4,abulletborder5,abulletborder6;
wire Xdisplay,Ydisplay;
reg [14:0]gameoveraddr;
reg [17:0]startaddr;
reg [16:0]winaddr;
wire [7:0]background,gameoverimg,startimg,winimg;
wire CLK_25,CLK_50;
reg [6:0] points;
reg [2:0] lives;

//  飞船
spaceship SHIP(sshipX,sshipY,truepulseL,truepulseR,CLK_25,rst,
    arX1,arY1,
    arX2,arY2,
    arX3,arY3,
    arX4,arY4,
    arX5,arY5,
    arX6,arY6,
    arfly1,arfly2,
    arfly3,arfly4,
    arfly5,arfly6,
    ahit,liveminus
    );
assign firespeed = sw1 + sw2; //    子弹调速通过开关实现
// 子弹
bullet BULLETSHIP(CLK_25,rst,sshipX,sshipY,
    rX,rY,
    arX1,arY1,
    arX2,arY2,
    arX3,arY3,
    arX4,arY4,
    arX5,arY5,
    arX6,arY6,
    arfly1,arfly2,
    arfly3,arfly4,
    arfly5,arfly6,
    1,truefire,rfly,hit,firespeed);

/************************外星人以及外星人子弹逻辑开始**************************/

wire arfly1,arfly2,arfly3,arfly4,arfly5,arfly6;
wire afire1,afire2,afire3,afire4,afire5,afire6;
wire aalive1,aalive2,aalive3,aalive4,aalive5;
wire aalive6,aalive7,aalive8,aalive9,aalive10;
wire aalive11,aalive12,aalive13,aalive14,aalive15;
wire hit1,hit2,hit3,hit4,hit5;
wire hit6,hit7,hit8,hit9,hit10;
wire hit11,hit12,hit13,hit14,hit15;
wire [9:0]aX1,aX2,aX3,aX4,aX5;
wire [8:0]aY1,aY2,aY3,aY4,aY5;
wire [9:0]a2X1,a2X2,a2X3,a2X4,a2X5;
wire [8:0]a2Y1,a2Y2,a2Y3,a2Y4,a2Y5;
wire [9:0]a3X1,a3X2,a3X3,a3X4,a3X5;
wire [8:0]a3Y1,a3Y2,a3Y3,a3Y4,a3Y5;

alien ALIEN1(CLK_25,rst,500,150,aX1,aY1,30,aalive1,rfly,rX,rY,hit1,afire1,100000000,0,startscreen,gameover,aliennumber);
alien ALIEN2(CLK_25,rst,430,150,aX2,aY2,30,aalive2,rfly,rX,rY,hit2,0,150000000,0,startscreen,gameover,aliennumber);
alien ALIEN3(CLK_25,rst,360,150,aX3,aY3,30,aalive3,rfly,rX,rY,hit3,0,150000000,0,startscreen,gameover,aliennumber);
alien ALIEN4(CLK_25,rst,290,150,aX4,aY4,30,aalive4,rfly,rX,rY,hit4,0,150000000,0,startscreen,gameover,aliennumber);
alien ALIEN5(CLK_25,rst,220,150,aX5,aY5,30,aalive5,rfly,rX,rY,hit5,afire2,100000000,0,startscreen,gameover,aliennumber);

alien ALIEN6(CLK_25,rst,500,98,a2X1,a2Y1,30,aalive6,rfly,rX,rY,hit6,0,150000000,0,startscreen,gameover,aliennumber);
alien ALIEN7(CLK_25,rst,430,98,a2X2,a2Y2,30,aalive7,rfly,rX,rY,hit7,afire3,100000000,aalive2,startscreen,gameover,aliennumber);
alien ALIEN8(CLK_25,rst,360,98,a2X3,a2Y3,30,aalive8,rfly,rX,rY,hit8,0,150000000,0,startscreen,gameover,aliennumber);
alien ALIEN9(CLK_25,rst,290,98,a2X4,a2Y4,30,aalive9,rfly,rX,rY,hit9,afire4,100000000,aalive4,startscreen,gameover,aliennumber);
alien ALIEN10(CLK_25,rst,220,98,a2X5,a2Y5,30,aalive10,rfly,rX,rY,hit10,0,150000000,0,startscreen,gameover,aliennumber);

alien ALIEN11(CLK_25,rst,500,50,a3X1,a3Y1,30,aalive11,rfly,rX,rY,hit11,0,150000000,0,startscreen,gameover,aliennumber);
alien ALIEN12(CLK_25,rst,430,50,a3X2,a3Y2,30,aalive12,rfly,rX,rY,hit12,afire5,100000000,(aalive7 || aalive2),startscreen,gameover,aliennumber);
alien ALIEN13(CLK_25,rst,360,50,a3X3,a3Y3,30,aalive13,rfly,rX,rY,hit13,0,150000000,0,startscreen,gameover,aliennumber);
alien ALIEN14(CLK_25,rst,290,50,a3X4,a3Y4,30,aalive14,rfly,rX,rY,hit14,afire6,100000000,(aalive9 || aalive4),startscreen,gameover,aliennumber);
alien ALIEN15(CLK_25,rst,220,50,a3X5,a3Y5,30,aalive15,rfly,rX,rY,hit15,0,150000000,0,startscreen,gameover,aliennumber);

bullet BULLET1(CLK_25,rst,aX1,aY1,arX1,arY1,rX,rY,0,0,0,0,0,0,0,0,0,0,rfly,0,0,0,0,0,0,afire1,arfly1,ahit,0);
bullet BULLET2(CLK_25,rst,aX5,aY5,arX2,arY2,rX,rY,0,0,0,0,0,0,0,0,0,0,rfly,0,0,0,0,0,0,afire2,arfly2,ahit,0);
bullet BULLET3(CLK_25,rst,a2X2,a2Y2,arX3,arY3,rX,rY,0,0,0,0,0,0,0,0,0,0,rfly,0,0,0,0,0,0,afire3,arfly3,ahit,0);
bullet BULLET4(CLK_25,rst,a2X4,a2Y4,arX4,arY4,rX,rY,0,0,0,0,0,0,0,0,0,0,rfly,0,0,0,0,0,0,afire4,arfly4,ahit,0);
bullet BULLET5(CLK_25,rst,a3X2,a3Y2,arX5,arY5,rX,rY,0,0,0,0,0,0,0,0,0,0,rfly,0,0,0,0,0,0,afire5,arfly5,ahit,0);
bullet BULLET6(CLK_25,rst,a3X4,a3Y4,arX6,arY6,rX,rY,0,0,0,0,0,0,0,0,0,0,rfly,0,0,0,0,0,0,afire6,arfly6,ahit,0);

/**********************************************************************************/

/****************************** 血槽，胜负判定模块 *********************************/

wire [4:0] aalivecounter1=aalive1;
wire [4:0] aalivecounter2 = aalive2;
wire [4:0] aalivecounter3=aalive3;
wire [4:0] aalivecounter4=aalive4;
wire [4:0] aalivecounter5=aalive5;
wire [4:0] aalivecounter6=aalive6;
wire [4:0] aalivecounter7=aalive7;
wire [4:0] aalivecounter8=aalive8;
wire [4:0] aalivecounter9=aalive9;
wire [4:0] aalivecounter10=aalive10;
wire [4:0] aalivecounter11=aalive11;
wire [4:0] aalivecounter12=aalive12;
wire [4:0] aalivecounter13=aalive13;
wire [4:0] aalivecounter14=aalive14;
wire [4:0] aalivecounter15=aalive15;

// 传入的外星人数量（调整外星人移动速度的）以5个为一阶

assign aliennumber = (aalivecounter1+aalivecounter2+aalivecounter3+aalivecounter4+aalivecounter5+aalivecounter6+aalivecounter7+aalivecounter8+aalivecounter9+aalivecounter10+aalivecounter11+aalivecounter12+aalivecounter13+aalivecounter14+aalivecounter15>=14)?4:
                     (aalivecounter1+aalivecounter2+aalivecounter3+aalivecounter4+aalivecounter5+aalivecounter6+aalivecounter7+aalivecounter8+aalivecounter9+aalivecounter10+aalivecounter11+aalivecounter12+aalivecounter13+aalivecounter14+aalivecounter15>=10)?3:
                     (aalivecounter1+aalivecounter2+aalivecounter3+aalivecounter4+aalivecounter5+aalivecounter6+aalivecounter7+aalivecounter8+aalivecounter9+aalivecounter10+aalivecounter11+aalivecounter12+aalivecounter13+aalivecounter14+aalivecounter15>=5)?2:
                     (aalivecounter1+aalivecounter2+aalivecounter3+aalivecounter4+aalivecounter5+aalivecounter6+aalivecounter7+aalivecounter8+aalivecounter9+aalivecounter10+aalivecounter11+aalivecounter12+aalivecounter13+aalivecounter14+aalivecounter15>=1)?1:0;

// 游戏开始逻辑

always@(posedge CLK_50 or posedge rst)
begin
    if(rst)
    begin
        startscreen <= 1;
    end else begin
        if(startscreen) begin
            if(startbutton) begin
                startscreen <= 0;
            end
        end
    end
end

// 游戏结束判定

assign gameover =   (aalive1 && aY1 >= sshipY - 22) ||
                    (aalive2 && aY2 >= sshipY - 22) ||
                    (aalive3 && aY3 >= sshipY - 22) ||
                    (aalive4 && aY4 >= sshipY - 22) ||
                    (aalive5 && aY5 >= sshipY - 22) ||
                    (aalive6 && a2Y1 >= sshipY - 30) ||
                    (aalive7 && a2Y2 >= sshipY - 30) ||
                    (aalive8 && a2Y3 >= sshipY - 30) ||
                    (aalive9 && a2Y4 >= sshipY - 30) ||
                    (aalive10 && a2Y5 >= sshipY - 30) ||
                    (aalive11 && a3Y1 >= sshipY - 22) ||
                    (aalive12 && a3Y2 >= sshipY - 22) ||
                    (aalive13 && a3Y3 >= sshipY - 22) ||
                    (aalive14 && a3Y4 >= sshipY - 22) ||
                    (aalive15 && a3Y5 >= sshipY - 22);

//  是否被外星人打中 

assign hit =    hit1 || hit2 || hit3 || hit4 || hit5 || hit6 || hit7 || hit8 || hit9 || hit10 || hit11 || hit12 || hit13 || hit14 || hit15;

// 没血了或者已经到边界了均判定为死亡

assign totalgameover = (gameover) || (livesgameover);

// 血量逻辑

always@(posedge CLK_25 or posedge rst)
begin
    if(rst)
    begin
        points <= 0;
        winscreen <= 0;
        livesgameover <=0 ;
        lives <= 0;
    end else begin
        points <=   90 - 15*lives;
        lives <= (liveminus) ? lives + 1 : lives;   //  被打一次计数器+1
        livesgameover <= (lives > 5) ? 1 : 0;       //  被打四次就没血了
        winscreen <= (hit1 && hit2 && hit3 && hit4 && hit5 && hit6 && hit7 && hit8 && hit9 && hit10 && hit11 && hit12 && hit13 && hit14 && hit15) ? 1 : 0;// 将外星人全部消灭即为赢得游戏
    end
end

/******************************************************************************/

/***************************按键去振动以及去毛刺************************************/

// 输出无振动的按键信号

Pulse PUL1(clk, rst, cleanL, pulseL);
Pulse PUL2(clk, rst, cleanR, pulseR);
Pulse PUL3(clk, rst, cleanfire, pulsefire);

// 信号去毛刺

debounce DBL(rst,clk,buttonL,cleanL);
debounce DBR(rst,clk,buttonR,cleanR);
debounce DBF(rst,clk,fire,cleanfire);

// 按键信号只在非开始界面才有                 

assign truefire = (startscreen)? 0 : pulsefire;
assign truepulseL = (startscreen)? 0 : pulseL;
assign truepulseR = (startscreen)? 0 : pulseR;

/*****************************************************************************/

/*************************VGA color以及显示模块********************************/

// HSYNC 和 VSYNC 信号

wire [9:0]haddr;
wire [8:0]vaddr;
VGA VGA(clk,rst,haddr,vaddr,active,hsync,vsync);

// 图片用 Block Memory 存储，h，v信号刷到对应位置的时候开始输出图片

blk_mem_gen_0 MEMSPACE(CLK_25,1,0,ship_addr,0,space_dout);
blk_mem_gen_1 MEMALIEN1(CLK_25,1,0,a_addr,0,a_dout);
blk_mem_gen_2 MEMALIEN2(CLK_25,1,0,a_addr,0,a2_dout);
blk_mem_gen_3 MEMALIEN3(CLK_25,1,0,a_addr,0,a3_dout);
blk_mem_gen_5 GAMEOVER(CLK_25,1,0,gameoveraddr,0,gameoverimg);
blk_mem_gen_6 START(CLK_25,1,0,startaddr,0,startimg);
blk_mem_gen_7 WIN(CLK_25,1,0,winaddr,0,winimg);

                
// 输出三排外星人的图片时会用到的图片边界
assign a1border =   aborder1 || aborder2 ||aborder3 || aborder4 || aborder5;
assign a2border =   aborder6 || aborder7 ||aborder8 || aborder9 || aborder10;
assign a3border =   aborder11 || aborder12 ||aborder13 || aborder14 || aborder15;

wire [9:0]a_addr;

assign a_addr = (aborder1)? a_addr1:
                (aborder2)? a_addr2:
                (aborder3)? a_addr3:
                (aborder4)? a_addr4:
                (aborder5)? a_addr5:
                (aborder6)? a_addr6:
                (aborder7)? a_addr7:
                (aborder8)? a_addr8:
                (aborder9)? a_addr9:
                (aborder10)? a_addr10:
                (aborder11)? a_addr11:
                (aborder12)? a_addr12:
                (aborder13)? a_addr13:
                (aborder14)? a_addr14:
                (aborder15)? a_addr15:
                0;      // 复用 a_addr, eg.当刷新到 aborder1 的范围时除了 aborder1 其他 aborder 均为 0，此时 a_addr = a_addr9.输出范围在 haddr
                        // haddr >= aX1 haddr <= aX1 + 29 与 vaddr >= aY1 vaddr <= aY1 + 21，画一个 alien 出来。
                    
assign ship_addr =  (shipborder)? space_addr : 
                    (lifeborder)? life_addr : 0;

// 用 clock wizard 分频（50MHz和25MHz各一个）
clk_wiz_0 clk_divider(CLK_50,CLK_25,rst,locked,clk);

// RGB 输出

always@(posedge CLK_50)
    begin
        VGA_R   <= {0,R};
        VGA_G   <= {0,G};
        VGA_B   <= {B};
    end 


// 做了一个巨大判定来决定什么时候RGB输出什么

always@(posedge CLK_25)
begin
    if(Xdisplay && Ydisplay)
    begin
        R <=    (startscreen)? startimg[7:5]:
                (totalgameover)? gameoverimg[7:5]:
                (winscreen)? winimg[7:5]:
                (scorecase)     ? 7 :
                (scoreborder)   ? 7 :
                (a3border)  ? a3_dout[7:5]:
                (a2border) ? a2_dout[7:5]:
                (a1border) ? a_dout[7:5]:
                (bulletborder) ? 7:
                (abulletborder1) ? 7:   
                (abulletborder2) ? 7:
                (abulletborder3) ? 7:
                (abulletborder4) ? 7:
                (abulletborder5) ? 7:
                (abulletborder6) ? 7:
                (shipborder)   ? space_dout[7:5] : space_dout[7:5] ;
        G <=    (startscreen)? startimg[4:2]:
                (totalgameover)? gameoverimg[4:2]:
                (winscreen)? winimg[4:2]:
                (scorecase)     ? 7 :
                (scoreborder)   ? 0 :
                (a3border)  ? a3_dout[4:2]:
                (a2border) ? a2_dout[4:2]:
                (a1border) ? a_dout[4:2]:
                (bulletborder) ? 7: 
                (abulletborder1) ? 0:
                (abulletborder2) ? 0:
                (abulletborder3) ? 0:
                (abulletborder4) ? 0:
                (abulletborder5) ? 0:
                (abulletborder6) ? 0:
                (shipborder)   ? space_dout[4:2] : space_dout[4:2] ;
        B <=    (startscreen)? startimg[1:0]:
                (totalgameover)? gameoverimg[1:0]:
                (winscreen)? winimg[1:0]:
                (scorecase)     ? 7 :
                (scoreborder)   ? 0 :
                (a3border)  ? a3_dout[1:0]:
                (a2border) ? a2_dout[1:0]:
                (a1border) ? a_dout[1:0]:
                (abulletborder1) ? 0:
                (abulletborder2) ? 0:
                (abulletborder3) ? 0:
                (abulletborder4) ? 0:
                (abulletborder5) ? 0:
                (abulletborder6) ? 0:
                (shipborder)   ? space_dout[1:0] : space_dout[1:0] ;
    end else begin
        R <= 0;
        B <= 0;
        G <= 0;
    end
end

//  画笔位置
always@(posedge CLK_25 or posedge rst)
begin
    if(rst)
    begin
        gameoveraddr <= 0;
        winaddr <= 0;
        space_addr <= 0;
        life_addr <= 0;
        a_addr1 <= 0;
        a_addr2 <= 0;
        a_addr3 <= 0;
        a_addr4 <= 0;
        a_addr5 <= 0;
        a_addr6 <= 0;
        a_addr7 <= 0;
        a_addr8 <= 0;
        a_addr9 <= 0;
        a_addr10 <= 0;
        a_addr11 <= 0;
        a_addr12 <= 0;
        a_addr13 <= 0;
        a_addr14 <= 0;
        a_addr15 <= 0;    
    end 
    else
    begin //    此处思路是判断画笔到屏幕的什么位置，如果到了下方定义的border内，addr就开始递增计数，使上面的block memory 输出不同的rgb信号，随着画笔位置的迁移，画出整个图片，该模块中的所有逻辑均是相同的.
        startaddr <= (vaddr <= 459 )? (startborder ? (startaddr + 1'b1): startaddr) : 0;    
        gameoveraddr <= (vaddr <= 264 )? (gameoverborder ? (gameoveraddr + 1'b1): gameoveraddr) : 0;
        winaddr <= (vaddr <= 320 )? (winborder ? (winaddr + 1'b1): winaddr) : 0;
        space_addr <= (vaddr == sshipY + 16)? 0 : ((shipborder)? (space_addr +  1'b1) : (space_addr));
        life_addr <= (vaddr == 38)? 0 : ((lifeborder)? (life_addr +  1'b1) : (life_addr));
        a_addr1 <= (vaddr == aY1 + 22)? 0 : ((aborder1)? (a_addr1 +  1'b1) : (a_addr1));
        a_addr2 <= (vaddr == aY2 + 22)? 0 : ((aborder2)? (a_addr2 +  1'b1) : (a_addr2));
        a_addr3 <= (vaddr == aY3 + 22)? 0 : ((aborder3)? (a_addr3 +  1'b1) : (a_addr3));
        a_addr4 <= (vaddr == aY4 + 22)? 0 : ((aborder4)? (a_addr4 +  1'b1) : (a_addr4));
        a_addr5 <= (vaddr == aY5 + 22)? 0 : ((aborder5)? (a_addr5 +  1'b1) : (a_addr5));
        a_addr6 <= (vaddr == a2Y1 + 30)? 0 : ((aborder6)? (a_addr6 +  1'b1) : (a_addr6));
        a_addr7 <= (vaddr == a2Y2 + 30)? 0 : ((aborder7)? (a_addr7 +  1'b1) : (a_addr7));
        a_addr8 <= (vaddr == a2Y3 + 30)? 0 : ((aborder8)? (a_addr8 +  1'b1) : (a_addr8));
        a_addr9 <= (vaddr == a2Y4 + 30)? 0 : ((aborder9)? (a_addr9 +  1'b1) : (a_addr9));
        a_addr10 <= (vaddr == a2Y5 + 30)? 0 : ((aborder10)? (a_addr10 +  1'b1) : (a_addr10));
        a_addr11 <= (vaddr == a3Y1 + 22)? 0 : ((aborder11)? (a_addr11 +  1'b1) : (a_addr11));
        a_addr12 <= (vaddr == a3Y2 + 22)? 0 : ((aborder12)? (a_addr12 +  1'b1) : (a_addr12));
        a_addr13 <= (vaddr == a3Y3 + 22)? 0 : ((aborder13)? (a_addr13 +  1'b1) : (a_addr13));
        a_addr14 <= (vaddr == a3Y4 + 22)? 0 : ((aborder14)? (a_addr14 +  1'b1) : (a_addr14));
        a_addr15 <= (vaddr == a3Y5 + 22)? 0 : ((aborder15)? (a_addr15 +  1'b1) : (a_addr15));
    end
end

reg aborder1,aborder2,aborder3,aborder4,aborder5;
reg aborder6,aborder7,aborder8,aborder9,aborder10;
reg aborder11,aborder12,aborder13,aborder14,aborder15;

// 这是规定的图片边界
always @(posedge CLK_50)
    begin
        scorecase <= (  ((haddr >= 9 && haddr <= 101)    && (vaddr >= 23 && vaddr <= 24)) ||
                        ((haddr >= 9 && haddr <= 101)    && (vaddr >= 31 && vaddr <= 32)) ||
                        ((haddr >= 9 && haddr <= 10)     && (vaddr >= 23 && vaddr <= 32)) ||
                        ((haddr >= 100 && haddr <= 101)   && (vaddr >= 23 && vaddr <= 32)));
        scoreborder <= (((haddr >= 10) && (haddr <= 9 + points)) && ((vaddr >= 25) && (vaddr <= 30) ));
        startborder <= (startscreen) && (((haddr >= 12) && (haddr <= 627)) && ((vaddr >= 21) && (vaddr <= 458)));    
 // 例如开始界面是一个616x438的图片时,我们令vaddr的上下界之和为479,之差为437(图片的宽度),haddr的上下界之和为639,上下界之差为615(图片的宽度),这样就得出了图片的边界值.
        gameoverborder <= (totalgameover) && (((haddr >= 126 ) && (haddr <= 513)) && ((vaddr >= 180) && (vaddr <= 263)));
        winborder <= (winscreen) && (((haddr >= 192 ) && (haddr <= 447)) && ((vaddr >= 141) && (vaddr <= 338)));
        shipborder <= (((haddr >= sshipX ) && (haddr <= sshipX + 30)) && ((vaddr >= sshipY) && (vaddr <= sshipY + 15)));
        bulletborder <= (rfly)?(((haddr >= rX ) && (haddr <= rX + 4)) && ((vaddr >= rY) && (vaddr <= rY + 8))):0;
        abulletborder1 <= (arfly1)?(((haddr >= arX1 ) && (haddr <= arX1 + 4)) && ((vaddr >= arY1) && (vaddr <= arY1 + 8))):0;
// 子弹,飞船和静态图片唯一的不同是它的横纵坐标边界为一个变量,在当前的坐标确定边界并输出图片即可.
        abulletborder2 <= (arfly2)?(((haddr >= arX2 ) && (haddr <= arX2 + 4)) && ((vaddr >= arY2) && (vaddr <= arY2 + 8))):0;
        abulletborder3 <= (arfly3)?(((haddr >= arX3 ) && (haddr <= arX3 + 4)) && ((vaddr >= arY3) && (vaddr <= arY3 + 8))):0;
        abulletborder4 <= (arfly4)?(((haddr >= arX4 ) && (haddr <= arX4 + 4)) && ((vaddr >= arY4) && (vaddr <= arY4 + 8))):0;
        abulletborder5 <= (arfly5)?(((haddr >= arX5 ) && (haddr <= arX5 + 4)) && ((vaddr >= arY5) && (vaddr <= arY5 + 8))):0;
        abulletborder6 <= (arfly6)?(((haddr >= arX6 ) && (haddr <= arX6 + 4)) && ((vaddr >= arY6) && (vaddr <= arY6 + 8))):0;
        aborder1 <= (aalive1)&&(((haddr >= aX1 ) && (haddr <= aX1 + 29)) && ((vaddr >= aY1) && (vaddr <= aY1 + 21)));
        aborder2 <= (aalive2)&&(((haddr >= aX2 ) && (haddr <= aX2 + 29)) && ((vaddr >= aY2) && (vaddr <= aY2 + 21)));
        aborder3 <= (aalive3)&&(((haddr >= aX3 ) && (haddr <= aX3 + 29)) && ((vaddr >= aY3) && (vaddr <= aY3 + 21)));
        aborder4 <= (aalive4)&&(((haddr >= aX4 ) && (haddr <= aX4 + 29)) && ((vaddr >= aY4) && (vaddr <= aY4 + 21)));
        aborder5 <= (aalive5)&&(((haddr >= aX5 ) && (haddr <= aX5 + 29)) && ((vaddr >= aY5) && (vaddr <= aY5 + 21)));
        aborder6 <= (aalive6)&&(((haddr >= a2X1 ) && (haddr <= a2X1 + 30)) && ((vaddr >= a2Y1) && (vaddr <= a2Y1 + 29)));
        aborder7 <= (aalive7)&&(((haddr >= a2X2 ) && (haddr <= a2X2 + 30)) && ((vaddr >= a2Y2) && (vaddr <= a2Y2 + 29)));
        aborder8 <= (aalive8)&&(((haddr >= a2X3 ) && (haddr <= a2X3 + 30)) && ((vaddr >= a2Y3) && (vaddr <= a2Y3 + 29)));
        aborder9 <= (aalive9)&&(((haddr >= a2X4 ) && (haddr <= a2X4 + 30)) && ((vaddr >= a2Y4) && (vaddr <= a2Y4 + 29)));
        aborder10 <= (aalive10)&&(((haddr >= a2X5 ) && (haddr <= a2X5 + 30)) && ((vaddr >= a2Y5) && (vaddr <= a2Y5 + 29)));
        aborder11 <= (aalive11)&&(((haddr >= a3X1 ) && (haddr <= a3X1 + 32)) && ((vaddr >= a3Y1) && (vaddr <= a3Y1 + 21)));
        aborder12 <= (aalive12)&&(((haddr >= a3X2 ) && (haddr <= a3X2 + 32)) && ((vaddr >= a3Y2) && (vaddr <= a3Y2 + 21)));
        aborder13 <= (aalive13)&&(((haddr >= a3X3 ) && (haddr <= a3X3 + 32)) && ((vaddr >= a3Y3) && (vaddr <= a3Y3 + 21)));
        aborder14 <= (aalive14)&&(((haddr >= a3X4 ) && (haddr <= a3X4 + 32)) && ((vaddr >= a3Y4) && (vaddr <= a3Y4 + 21)));
        aborder15 <= (aalive15)&&(((haddr >= a3X5 ) && (haddr <= a3X5 + 32)) && ((vaddr >= a3Y5) && (vaddr <= a3Y5 + 21)));
    end
/****************************************************************************************/
endmodule

```

 