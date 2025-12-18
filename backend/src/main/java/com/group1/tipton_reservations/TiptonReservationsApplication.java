package com.group1.tipton_reservations;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class TiptonReservationsApplication {

	public static void main(String[] args) {
		SpringApplication.run(TiptonReservationsApplication.class, args);
	}

}
