package com.projectmanagement.project_management_system.Exception;

/**
 * Thrown when attempting to register with an email that already exists.
 */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("User already exists with email: " + email);
    }
}
