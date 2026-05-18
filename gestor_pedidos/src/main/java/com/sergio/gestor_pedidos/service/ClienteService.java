package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.ClienteRequestDTO;
import com.sergio.gestor_pedidos.dto.ClienteResponseDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.exception.ReglaDeNegocioException;
import com.sergio.gestor_pedidos.mapper.ClienteMapper;
import com.sergio.gestor_pedidos.model.Cliente;
import com.sergio.gestor_pedidos.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    @Transactional
    public ClienteResponseDTO crearCliente(ClienteRequestDTO dto) {
        if (clienteRepository.existsByEmail(dto.getEmail())) {
            throw new ReglaDeNegocioException("Ya existe un cliente con el email: " + dto.getEmail());
        }
        Cliente guardado = clienteRepository.save(clienteMapper.toEntity(dto));
        return clienteMapper.toResponse(guardado);
    }

    public Page<ClienteResponseDTO> listarClientes(Pageable pageable) {
        return clienteRepository.findByActivoTrue(pageable)
                .map(clienteMapper::toResponse);
    }

    public ClienteResponseDTO obtenerPorId(Long id) {
        return clienteMapper.toResponse(buscarOFallar(id));
    }

    @Transactional
    public ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = buscarOFallar(id);
        if (!cliente.getEmail().equals(dto.getEmail()) && clienteRepository.existsByEmail(dto.getEmail())) {
            throw new ReglaDeNegocioException("El email ya está en uso: " + dto.getEmail());
        }
        cliente.setNombre(dto.getNombre());
        cliente.setEmail(dto.getEmail());
        cliente.setCiudad(dto.getCiudad());
        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public void desactivar(Long id) {
        Cliente cliente = buscarOFallar(id);
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    public List<ClienteResponseDTO> buscarPorNombre(String nombre) {
        return clienteRepository.buscarPorNombre(nombre).stream()
                .map(clienteMapper::toResponse).toList();
    }

    public List<ClienteResponseDTO> listarPorCiudad(String ciudad) {
        return clienteRepository.findByCiudad(ciudad).stream()
                .map(clienteMapper::toResponse).toList();
    }

    // Uso interno (otros servicios)
    public Cliente buscarOFallar(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + id));
    }
}
