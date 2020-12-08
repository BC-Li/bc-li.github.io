---
title: "Space Invaders" on FPGA: How it's built and how it functions
layout: single
category: blog
header:
  overlay_image: /assets/images/2.jpg
author_profile: true
toc: true
---
Space Invaders on FPGA is a project migrated from this [repo](https://github.com/nikkatsa7/SpaceInvadersFpgaGame). This article aims at explaining how the project is built and some logic behind it.

# Modules

Main design is shown in annotations ^ ^

## spaceship

```verilog
module spaceship
    (spaceshipX,spaceshipY,btnL,btnR,clk,rst,
    alienrocketX1,alienrocketY1,
    alienrocketX2,alienrocketY2,
    alienrocketX3,alienrocketY3,
    alienrocketX4,alienrocketY4,
    alienrocketX5,alienrocketY5,
    alienrocketX6,alienrocketY6,
    alienrocket1,alienrocket2,
    alienrocket3,alienrocket4,
    alienrocket5,alienrocket6,
    alienhit,liveminus);
    input btnL,btnR;	//button L and button R
    input clk,rst;
    output reg [9:0]spaceshipX;	//	the position X of spaceship
    output reg [8:0]spaceshipY;	//  the position Y of spaceship
    output reg alienhit,liveminus;	
    input alienrocket1,alienrocket2,alienrocket3,alienrocket4,alienrocket5,alienrocket6;
    input [9:0]alienrocketX1,alienrocketX2,alienrocketX3,alienrocketX4,alienrocketX5,alienrocketX6;	// the position X of aliens
    input [8:0]alienrocketY1,alienrocketY2,alienrocketY3,alienrocketY4,alienrocketY5,alienrocketY6;	// the position Y of aliens
     
    always@(posedge clk or posedge rst)
    begin
        if(rst)
        begin
            spaceshipX <= 10'd310;
            spaceshipY <= 9'd400;
            alienhit <= 0;
            liveminus <= 0;
        end
        else begin
            if(btnL) begin	// button left
                spaceshipX <= (spaceshipX > 11)? (spaceshipX - 10'd1):spaceshipX;
            end // if hit the border remain at the same position
            else if(btnR) begin	// button right
                spaceshipX <= (spaceshipX < 598)? (spaceshipX + 9'd1):spaceshipX;
            end
            if ((alienrocket1 &&(((alienrocketX1 >= spaceshipX -2)&&(alienrocketX1 <= spaceshipX + 33))&&(alienrocketY1 == spaceshipY)))  ||  
                (alienrocket2 &&(((alienrocketX2 >= spaceshipX -2)&&(alienrocketX2 <= spaceshipX + 33))&&(alienrocketY2 == spaceshipY)))  ||
                (alienrocket3 &&(((alienrocketX3 >= spaceshipX -2)&&(alienrocketX3 <= spaceshipX + 33))&&(alienrocketY3 == spaceshipY)))  ||
                (alienrocket4 &&(((alienrocketX4 >= spaceshipX -2)&&(alienrocketX4 <= spaceshipX + 33))&&(alienrocketY4 == spaceshipY)))  ||
                (alienrocket5 &&(((alienrocketX5 >= spaceshipX -2)&&(alienrocketX5 <= spaceshipX + 33))&&(alienrocketY5 == spaceshipY)))  ||
                (alienrocket6 &&(((alienrocketX6 >= spaceshipX -2)&&(alienrocketX6 <= spaceshipX + 33))&&(alienrocketY6 == spaceshipY)))) 
            begin
                alienhit <= 1'b1;
                liveminus <= 1'b1;
            end else begin
                alienhit <= 0;
                liveminus <= 0;
            end
        end
    end
endmodule
```